const dbConn = require("../../config/db.config");

const requestResponseModel = {
  save_request_log: async (req) => {
    try {

      const requestBody = JSON.stringify(req.body);
      const results = await new Promise((resolve, reject) => {
        dbConn.query("CALL sp_insert_request_response_log(?,?,?)", [
          req.method,
          req.url,
          requestBody,
        ],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          });
      })
      // console.log(results[0][0].id, "id1");

      return results[0][0].id;
    }

    catch (error) {
      console.error("Error getting job details:", error);
      throw error;
    }
  },


  update_request_log: async (id, data) => {
    try {


      const requestBody = JSON.stringify(data);
      const results = await new Promise((resolve, reject) => {
        dbConn.query("CALL sp_update_request_response(?,?)", [
          id,
          requestBody
        ], (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result)
          }
        });
      })
      return results[0][0].id;
    } catch (error) {
      console.error("Error getting job details:", error);
      throw error;
    }
  },

  save_error_log: async (req, res, data) => {
    try {

      const requestBody = JSON.stringify(req.body);
      const responseBody = JSON.stringify(data);
      const results = await new Promise((resolve, reject) => {
        dbConn.query("CALL sp_insert_error_log(?,?,?,?,?)", [
          req.method,
          req.url,
          res.statusCode,
          requestBody,
          responseBody
        ], (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        });

      })

      return results[0][0];

    } catch (error) {
      console.error("Error getting job details:", error);
      throw error;
    }
  }
}
module.exports = requestResponseModel;

