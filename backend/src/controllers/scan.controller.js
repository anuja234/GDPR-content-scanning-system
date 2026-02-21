const documentModel = require("../models/document.model");

exports.getScanHistory = async (req, res) => {
  try {
    const scans = await documentModel.getAllScans();
    res.json(scans);
  } catch (err) {
    console.error("SCAN HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
};
