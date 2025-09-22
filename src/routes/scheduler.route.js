// route.js

const express = require('express');
const schedulerController = require('../Controller/scheduler.controller');
const {convertToDoc,updateSchedulerTableStatus,getMailPreview,reSchedule,stopMail,deleteMail} = require('../Controller/DB/mail-scheduler');
const router = express.Router();

router.post('/getAllEmailSchedule', schedulerController.getAllEmailSchedule);
router.post('/convertToDoc',convertToDoc)
router.post('/updateMailSchedulerStatus',updateSchedulerTableStatus)
router.post('/getAllEmailScheduleForMailSending', schedulerController.getAllEmailScheduleForMailSending);
router.post('/getAllEmailLogs', schedulerController.getAllEmailLogs);
router.post('/getMailPreview', getMailPreview);
router.post('/re-schedule', reSchedule);
router.post('/stop-email', stopMail);
router.post('/delete-email', deleteMail);

router.get('/get-bounce-info', schedulerController.getBounceInfo);
module.exports = router;
