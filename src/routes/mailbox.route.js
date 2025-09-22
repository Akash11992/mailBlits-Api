
const express = require('express');
const router = express.Router();

const {linkMailbox} = require('../Controller/DB/mailbox')


router.post('/link',linkMailbox)

module.exports = router