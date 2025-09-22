const express = require('express')
const router = express.Router()
const reportController = require('../Controller/reports.controller');
const { getUsersAuditReport, getAuditReportDropdown } = require('../Controller/AuditReport.controller');



// router.post('/get-email-analytics', reportController.getAllEmailLogs);
//router.post('/get-sent-email-status', reportController.getSentEmailStatus);
router.post('/get-sent-email-status', reportController.getSentEmailStatus);

router.post('/get-bouncee-email-status', reportController.getBounceEmailStatus);


router.post('/get-email-analytics', reportController.getEmailAnalytics);
router.get('/getAuditReportMenus', getAuditReportDropdown);
router.post('/getUsersAuditReport', getUsersAuditReport);

module.exports = router