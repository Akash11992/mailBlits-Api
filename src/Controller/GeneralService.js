const conn = require('./../../config/db.config').promise();
const GeneralServiceModel =require("../Models/General_service_model");

exports.GetAllDesignations = async (req, res, next) => {
  try {
    const [rows] = await GeneralServiceModel.getAllDestinationList(req,res);
    if (rows) {
      return res.status(201).json({
        success: true,
        message: "Designations fetched successfully.",
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Designations data could not be fetched.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}

exports.GetAllCountryCode = async (req, res, next) => {
  try {
    const [rows] = await GeneralServiceModel.getCountryList(req,res);
   
    if (rows) {
      return res.status(201).json({
        success: true,
        message: "Country code fetched successfully.",
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Country code could not be fetched.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
}