const express = require("express");
const router = express.Router();
// Renamed to scanController for better clarity, assuming upload.controller handles scanning
const scanController = require("../controllers/upload.controller"); 

router.post("/scan-text", scanController.scanText);

router.post(
  "/scan-file",
  scanController.uploadMiddleware,  
  scanController.scanFile
);

module.exports = router;