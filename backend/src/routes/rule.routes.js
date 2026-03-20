const express = require("express");

const router = express.Router();

const ruleController = require("../controllers/rule.controller");


router.get("/rules", ruleController.getRules);

router.get("/rules/search", ruleController.searchRules);

router.post("/rules", ruleController.addRule);

router.patch("/rules/:id/toggle", ruleController.toggleRule);

router.delete("/rules/:id", ruleController.deleteRule);

router.put('/rules/:id', ruleController.updateRule);


module.exports = router;