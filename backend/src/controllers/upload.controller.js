const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pool = require("../config/db");

/* ---------------- MULTER CONFIG ---------------- */

const allowedExtensions = [".pdf", ".txt", ".csv", ".xls", ".xlsx"];

const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.uploadMiddleware = upload.single("file");

/* ---------------- TEXT SCAN ---------------- */

exports.scanText = async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      "http://localhost:8000/scan-text",
      { text }
    );

    const redactedText = response.data.redactedText || "";
    const rawViolations = response.data.violations || [];

    const violations = normalizeViolations(rawViolations);

    const scanResult = await pool.query(
      `INSERT INTO scans (scan_type, redacted_content)
       VALUES ($1, $2) RETURNING id`,
      ["TEXT", redactedText]
    );

    const scanId = scanResult.rows[0].id;

    await storeViolations(scanId, violations);

    res.json({ scanId, redactedText, violations });

  } catch (err) {
    console.error("TEXT SCAN ERROR:", err);
    res.status(500).json({ error: "Text scan failed" });
  }
};

/* ---------------- FILE SCAN ---------------- */

exports.scanFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("FILE RECEIVED:", req.file.originalname);

    const formData = new FormData();
    formData.append(
      "file",
      fs.createReadStream(req.file.path),
      req.file.originalname
    );

    const response = await axios.post(
      "http://localhost:8001/scan-file",
      formData,
      { headers: formData.getHeaders() }
    );

    fs.unlinkSync(req.file.path);

    const redactedText = response.data.redactedText || "";
    const rawViolations = response.data.violations || [];

    const violations = normalizeViolations(rawViolations);

    const scanResult = await pool.query(
      `INSERT INTO scans (scan_type, redacted_content)
       VALUES ($1, $2) RETURNING id`,
      ["FILE", redactedText]
    );

    const scanId = scanResult.rows[0].id;

    await storeViolations(scanId, violations);

    res.json({ scanId, redactedText, violations });

  } catch (err) {
    console.error("FILE SCAN ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
};


function normalizeViolations(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === "object" && raw !== null) {
    return Object.entries(raw).map(([type, count]) => ({
      type,
      value: `Count: ${count}`
    }));
  }

  return [];
}

async function storeViolations(scanId, violations) {
  for (const v of violations) {
    await pool.query(
      `INSERT INTO violations (scan_id, type, value)
       VALUES ($1, $2, $3)`,
      [scanId, v.type, v.value]
    );
  }
}