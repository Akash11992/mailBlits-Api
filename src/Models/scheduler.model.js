const { log } = require("handlebars/runtime");
const db = require("../../config/db.config");

const schedulerModel = {
  getAllEmailSchedule: async (userDetails,status_type_id,page_number,pageSize,campaign_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log("cid...",userDetails.companyId,campaign_id);
        if (typeof campaign_id === 'undefined') {
          campaign_id = null;
      }
      // console.log("campaign_id...",campaign_id);

        db.query(
          "CALL sp_getAllSchedulerDetailsByCid(?,?,?,?,?)",
          [userDetails.companyId,status_type_id,page_number,pageSize,campaign_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log(result);
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getAllEmailScheduleForMailSending: async (email_status_id) => {
    // console.log(company_id);
    try {

      if (!email_status_id) {
        throw new Error('Invalid email_status_id');
      }

      const result = await new Promise((resolve, reject) => {
        // console.log("cid...",userDetails.companyId);

        console.log(email_status_id);

        db.query(
          "CALL sp_getAllSchedulerDetailsByCid_forSendingEmail(?)",
          [email_status_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log(result);
              resolve(result);
            }
          }
        );
      });

      // Check if result has the expected structure
    if (!Array.isArray(result) || !result[0]) {
      throw new Error('Unexpected result format');
    }

      return result;
    } catch (err) {
      throw err;
    }
  },

  getAllEmailLogs: async (
    company_id,
    campaign_id,
    contact_id,
    email_date,
    scheduler_time,
    email_status_id
  ) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log("cid...",userDetails.companyId);
        db.query(
          "CALL sp_getEmailLogs(?,?,?,?,?,?)",
          [
            company_id,
            campaign_id,
            contact_id,
            email_date,
            scheduler_time,
            email_status_id,
          ],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log(result);
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getBounceInfo: async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_get_bounce_info()",
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
};
module.exports = schedulerModel;
