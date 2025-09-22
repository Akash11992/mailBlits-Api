// segment.controller.js

const SegmentModel = require('../Models/segment.model');
const { verifyJwt } = require("../Controller/jwtAuth");

const SegmentController = {};

SegmentController.createSegment = (req, res) => {
  const userDetails = verifyJwt(req);
  //   const { company_id, segment_Name, quantities, is_active } = req.body;

  SegmentModel.insertOrUpdateSegment(req.body,userDetails,(err, result) => {
    if (err) {
      console.error('Error inserting or updating segment:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Segment added successfully!' });
  });



};
SegmentController.getAllOptionsSegments = (req, res) => {
  SegmentModel.getAllOptionsSegments((err, segments) => {
    if (err) {
      console.error('Error fetching options segments:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ segments });
  });
};

SegmentController.getSegmentsByCompanyId = (req, res) => {

  const userDetails = verifyJwt(req);
  // const { company_id } = req.params;

  SegmentModel.getSegmentsByCompanyId(userDetails, (err, segments) => {
    if (err) {
      console.error('Error fetching segments by company_id:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ data: segments, error: false });
  });
};

SegmentController.SegmentsBydelete = (req, res) => {

  const userDetails = verifyJwt(req);
  const { id } = req.params;
  console.log(id);

  SegmentModel.SegmentsBydelete(userDetails, id, (err, segments) => {
    if (err) {
      console.error('Error fetching segments by company_id:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ success: true, error: false,message:"Segment deleted successfully!" });
  });
};


SegmentController.SegmentsByupdate = (req, res) => {

  const userDetails = verifyJwt(req);
  const id  = req.params;
  const body = req.body
const cid = userDetails.companyId
  console.log(id);
const data = JSON.stringify(req.body.quantities);
console.log(data);
  SegmentModel.SegmentsByupdate(cid, id, body,data,userDetails,(err, segments) => {
    if (err) {
      console.error('Error fetching segments by company_id:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ data: segments, error: false ,message:"Segments Updated successfully! "});
  });
};

SegmentController.SegmentsByidget = (req, res) => {

  const userDetails = verifyJwt(req);
  const { id } = req.params;
  // const body = req.body

  console.log(id,"id");

  SegmentModel.SegmentsByidget(userDetails,id, (err, segments) => {
    if (err) {
      console.error('Error fetching segments by company_id:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ data: segments, error: false });
  });
};

module.exports = SegmentController;
