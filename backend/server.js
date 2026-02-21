const app = require("./app");

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});











// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const pool = require("./src/config/db");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// /* -------------------------
//    TEXT SCAN
// -------------------------- */
// app.post("/scan-text", async (req, res) => {
//   try {
//     const { text } = req.body;

//     const response = await axios.post(
//       "http://localhost:8001/scan-text",
//       { text }
//     );

//     const { redactedText, violations } = response.data;

//     const scanResult = await pool.query(
//       `INSERT INTO scans (scan_type, redacted_content)
//        VALUES ($1, $2)
//        RETURNING id`,
//       ["TEXT", redactedText]
//     );

//     const scanId = scanResult.rows[0].id;

//     for (const v of violations) {
//       await pool.query(
//         `INSERT INTO violations (scan_id, type, value)
//          VALUES ($1, $2, $3)`,
//         [scanId, v.type, v.value]
//       );
//     }

//     res.json({
//       scanId,
//       redactedText,
//       violations
//     });

//   } catch (err) {
//     console.error("TEXT SCAN ERROR:", err);
//     res.status(500).json({ error: "Text scan failed" });
//   }
// });

// /* -------------------------
//    FILE SCAN
// -------------------------- */
// app.post("/scan-file", upload.single("file"), async (req, res) => {
//   try {
//     const formData = new FormData();
//     formData.append(
//       "file",
//       fs.createReadStream(req.file.path),
//       req.file.originalname
//     );

//     const response = await axios.post(
//       "http://localhost:8001/scan-file",
//       formData,
//       { headers: formData.getHeaders() }
//     );

//     fs.unlinkSync(req.file.path);

//     const { redactedText, violations } = response.data;

//     const scanResult = await pool.query(
//       `INSERT INTO scans (scan_type, redacted_content)
//        VALUES ($1, $2)
//        RETURNING id`,
//       ["FILE", redactedText]
//     );

//     const scanId = scanResult.rows[0].id;

//     for (const v of violations) {
//       await pool.query(
//         `INSERT INTO violations (scan_id, type, value)
//          VALUES ($1, $2, $3)`,
//         [scanId, v.type, v.value]
//       );
//     }

//     res.json({
//       scanId,
//       redactedText,
//       violations
//     });

//   } catch (err) {
//     console.error("FILE SCAN ERROR:", err);
//     res.status(500).json({ error: "File scan failed" });
//   }
// });


// app.get("/api/scans", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT
//         scans.id,
//         scans.scan_type,
//         scans.created_at,
//         COUNT(violations.id) AS violation_count
//       FROM scans
//       LEFT JOIN violations ON scans.id = violations.scan_id
//       GROUP BY scans.id
//       ORDER BY scans.created_at DESC
//     `);

//     res.json(result.rows);

//   } catch (err) {
//     console.error("FETCH SCANS ERROR:", err);
//     res.status(500).json({ error: "Failed to fetch scans" });
//   }
// });

// app.listen(4000, () => {
//   console.log("Backend running on port 4000");
// });
