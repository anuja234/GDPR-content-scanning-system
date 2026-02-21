const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/upload.controller");

router.post("/scan-text", uploadController.scanText);

router.post(
  "/scan-file",
  uploadController.uploadMiddleware,  
  uploadController.scanFile
);

module.exports = router;
