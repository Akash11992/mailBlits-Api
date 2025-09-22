// unsubscribe.route.js

const express = require('express');
const router = express.Router();
const unsubscribeController = require('../Controller/unsubscribe.controller');

router.post('/insert', unsubscribeController.insertUnsubscribe);

module.exports = router;
