from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import pandas as pd
import re
from io import BytesIO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_pii(text: str):
    violations = []

    emails = re.findall(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text
    )

    phones = re.findall(r"\b\d{10}\b", text)

    adhars = re.findall(r"\b\d{12}\b", text)

    for e in emails:
        violations.append({
            "type": "EMAIL",
            "value": e
        })

    for p in phones:
        violations.append({
            "type": "PHONE",
            "value": p
        })

    for a in adhars:
        violations.append({
            "type": "AADHAR",
            "value": a
        })

    return violations


def redact_text(text: str, violations: list):
    redacted = text

    for v in violations:
        if v["type"] == "EMAIL":
            redacted = redacted.replace(v["value"], "********")
        elif v["type"] in ["PHONE", "AADHAR"]:
            redacted = redacted.replace(
                v["value"], "******" + v["value"][-4:]
            )

    return redacted



class TextRequest(BaseModel):
    text: str


@app.post("/scan-text")
async def scan_text(data: TextRequest):
    text = data.text

    violations = detect_pii(text)
    redacted_text = redact_text(text, violations)

    return {
        "redactedText": redacted_text,
        "violations": violations
    }


@app.post("/scan-file")
async def scan_file(file: UploadFile = File(...)):
    extracted_text = ""

    if file.content_type == "application/pdf":
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"

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
    redacted_text = redact_text(extracted_text, violations)

    return {
        "redactedText": redacted_text[:5000], 
        "violations": violations
    }