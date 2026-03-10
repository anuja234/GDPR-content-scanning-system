const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scan.controller");

router.get("/scans", scanController.getScanHistory);
router.get("/scans/:id/violations", scanController.getScanViolations);

module.exports = router;