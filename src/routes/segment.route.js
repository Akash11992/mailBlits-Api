// segment.route.js

const express = require('express');
const router = express.Router();
const SegmentController = require('./../Controller/segment.controller');

// Define API routes
router.post('/segments', SegmentController.createSegment);
router.get('/segments/options', SegmentController.getAllOptionsSegments);
router.get('/segments/company', SegmentController.getSegmentsByCompanyId);
router.delete('/segments/:id', SegmentController.SegmentsBydelete);
router.put ('/segments/:id', SegmentController.SegmentsByupdate);
router.get('/segments/:id', SegmentController.SegmentsByidget);

module.exports = router;
