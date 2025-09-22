// unsubscribe.controller.js

const unsubscribeModel = require('../Models/unsubscribe.model');

const insertUnsubscribe = async (req, res) => {
    try {
      const { company_id, campaign_id, email, reason, created_by } = req.body;
      const result = await unsubscribeModel.insertUnsubscribeData(company_id, campaign_id, email, reason, created_by);
      console.log(result[0][0].success_code);
      // Check if unsubscribe operation was successful
      if (result[0][0].success_code > 0) {
        res.json({ success: true, success_code: 1, message: "Unsubscribe operation successful" });
      } else {
        res.json({ success: false, success_code: 0, message: "Unsubscribe operation failed" });
      }
    } catch (error) {
      res.status(500).json({ success: false, success_code: 0, error: error.message });
    }
  };
  
  module.exports = {
    insertUnsubscribe,
  };
