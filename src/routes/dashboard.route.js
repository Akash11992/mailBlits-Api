// route.js

const express = require('express');
const dashboardController = require('../Controller/dashboard.controller');
const router = express.Router();



router.get('/getDashboardInfo', dashboardController.getDashboardInfo);

module.exports = router;
