from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pdfplumber
import pandas as pd
from io import BytesIO
import os

from services.pii_detector import detect_pii, redact_text
from services.file_redactor import generate_redacted_file
from db import get_db_connection


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str


class RedactRequest(BaseModel):
    scan_id: int
    file_path: str


@app.get("/")
def health():
    return {"status": "AI Service Running"}


# -----------------------------
# TEXT SCAN
# -----------------------------

@app.post("/scan-text")
async def scan_text(data: TextRequest):

    violations = detect_pii(data.text)
    redacted = redact_text(data.text, violations)

    return {
        "redactedText": redacted,
        "violations": violations
    }


# -----------------------------
# FILE SCAN
# -----------------------------

@app.post("/scan-file")
async def scan_file(file: UploadFile = File(...)):

    extracted_text = ""

    if file.content_type == "application/pdf":

        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"

    elif file.content_type == "text/plain":

        extracted_text = (await file.read()).decode("utf-8")

    elif file.content_type == "text/csv":

        df = pd.read_csv(file.file)
        extracted_text = df.astype(str).to_string(index=False)

    elif file.content_type in [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]:

        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))
        extracted_text = df.astype(str).to_string(index=False)

    else:

        return {
            "redactedText": "",
            "violations": [],
            "error": "Unsupported file type"
        }

    violations = detect_pii(extracted_text)
    redacted = redact_text(extracted_text, violations)

    return {
        "redactedText": redacted[:5000],
        "violations": violations
    }


# -----------------------------
# GENERATE REDACTED FILE
# -----------------------------

@app.post("/generate-redacted-file")
def generate_file(data: RedactRequest):

    scan_id = data.scan_id
    original_file = data.file_path

    print("Received file:", original_file)
    print("File exists:", os.path.exists(original_file))

    if not os.path.exists(original_file):

        return {
            "file": None,
            "error": f"File not found: {original_file}"
        }

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT original_value, redacted_value
        FROM redactions
        JOIN violations
        ON redactions.violation_id = violations.id
        WHERE violations.scan_id = %s
        """,
        (scan_id,)
    )

    rows = cur.fetchall()

    replacements = {}

    for original, redacted in rows:
        replacements[original] = redacted


    os.makedirs("storage/redacted_files", exist_ok=True)

    output_path = f"storage/redacted_files/redacted_scan_{scan_id}.pdf"


    generate_redacted_file(
        original_file,
        output_path,
        replacements
    )


    if not os.path.exists(output_path):

        return {
            "file": None,
            "error": "Redacted file generation failed"
        }

    return {
        "file": output_path
    }