const express = require('express');
const router = express.Router();
const integratedModuleController = require('../Controller/integratedModuleController');

router.get('/list', integratedModuleController.getModuleList);
router.post('/storeToken', integratedModuleController.storeToken);
router.get('/:id', integratedModuleController.getModule);
router.get('/filters/:id/:apiId', integratedModuleController.getFilters);
router.post('/insertContactBulkDataInList', integratedModuleController.bulkInsert);
router.post('/validateToken', integratedModuleController.validateToken);


module.exports = router