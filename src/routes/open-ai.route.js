const express = require('express');
const router = express.Router();
const templatetController = require('../Controller/template.controller');
const campaignController = require('../Controller/campaign.controller');

router.post("/generate-template", templatetController.generateTemplate);
router.post("/generate-subject", campaignController.generateSubject);

module.exports = router;