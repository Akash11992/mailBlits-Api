const express = require('express');
const router = express.Router();
const emailSender = require('../Controller/EmailSender.controller');
// const auth = require("../middleware/auth");


router.post('/create', emailSender.create);


module.exports = router