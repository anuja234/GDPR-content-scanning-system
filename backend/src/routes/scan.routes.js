const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scan.controller");

router.get("/scans", scanController.getScanHistory);

module.exports = router;
