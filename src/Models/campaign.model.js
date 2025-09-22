const { log } = require("handlebars/runtime");
const db = require("../../config/db.config");
const { schedule } = require("node-cron");

const campaignModel = {
  createCampaign: async (
    userDetails,
    body,
    files,
    scheduledEmailsRule_result
  ) => {
    try {
      let results = [];

      // Insert rows for each file
      for (const file of files) {
        try {
          const fileResult = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_create_attachment_campaign_mapping(?,?,?,?,?,?)",
              [
                userDetails.companyId,
                body.campaign_name,
                file.originalname,
                file.mimetype,
                file.path,
                userDetails.user_id,
              ],
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
          if (fileResult) { // Check if fileResult is defined
            // console.log("fileResult",fileResult);
            // results.push(fileResult);
        }
        } catch (error) {
          console.error("Error inserting file:", error);
        }
      }

      // Insert scheduling rules for the campaign
      for (const emailRule of scheduledEmailsRule_result) {
        try {
          const ruleResult = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_create_email_scheduler_rule_for_campaign_OnschedulingTime(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              [
                userDetails.companyId,
                emailRule.campaign_id,
                emailRule.contactId,
                emailRule.is_send_immediately,
                body.schedule_date,
                emailRule.schedule_time,
                emailRule.schedule_timezone_id,
                emailRule.schedule_daily_limit,
                emailRule.email_day_id,
                emailRule.sendEmailDate,
                userDetails.user_id,
                body.from_user_id,
                body.cc,
                body.bcc,
                body.isEmailTrackingEnabled
              ],
              (err, result) => {
                if (err) {
                  console.error(err);
                  reject(err);
                } else {
                  console.log("result:schedule time",result);
                  resolve(result);
                }
              }
            );
          });
          // console.log("ruleResult",ruleResult);
          if(ruleResult){
          results.push(ruleResult);}
        } catch (error) {
          console.error("Error inserting scheduling rule:", error);
        }
      }

      // Insert campaign-day mappings

      if (body.email_days_id === "") {
        body.email_days_id = null;
      }

      // console.log("email_days_id", body.email_days_id);
      const days_ids = body.email_days_id
        ?.split(",")
        .map((id) => parseInt(id?.trim()));

      // Array to store all results

      // Iterate through all possible dayIds
      for (let i = 1; i <= 7; i++) {
        const dayId = i;
        const is_active = days_ids?.includes(dayId) ? 1 : 0; // Set is_active based on inclusion in days_ids

        if (!isNaN(dayId)) {
          try {
            const dayIdResult = await new Promise((resolve, reject) => {
              db.query(
                "CALL sp_create_days_campaign_mapping(?,?,?,?,?)",
                [
                  userDetails.companyId,
                  body.campaign_name,
                  dayId,
                  is_active,
                  userDetails.user_id,
                ],
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
            if(dayIdResult){
            // results.push(dayIdResult);
          }
          } catch (error) {
            console.error("Error inserting day_id:", error);
          }
        } else {
          console.error("Invalid day_id:", dayId);
        }
      }

      return results;
    } catch (err) {
      throw err;
    }
  },
  validateCampaignExistance: async (userDetails, body) => {
    try {
      var result = await callCampaignExistanceCheckProcedure(userDetails, body);

      return result;
    } catch (err) {
      throw err;
    }
  },
  getAllCampaign: async (userDetails) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_campaign(?)",
          [userDetails.companyId],
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
  getAllCountriesTimezone: async (userDetails) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_getAllCountries_timezone_list()", (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getAllDays: async (userDetails) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_getAlldays()", (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getActiveCampaigns: async (userDetails) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_get_active_campaign_list(?)",[userDetails.companyId], (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  },

  getAllContact: async (userDetails, list_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getAllContactDetailsByCid_ListId(?,?)",
          [userDetails.companyId, list_id],
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

  getUserTemplate: async (userDetails, campaign_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...temp", [
          userDetails.companyId,
          campaign_id,
          "template",
        ]);
        db.query(
          "CALL sp_getScheduler_Template_Document_DetailsByCampaignId(?,?,?)",
          [userDetails.companyId, campaign_id, "template"],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              console.log(result);
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
  getUserDocument: async (userDetails, campaign_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getScheduler_Template_Document_DetailsByCampaignId(?,?,?)",
          [userDetails.companyId, campaign_id, "document"],
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
async function callCampaignExistanceCheckProcedure(userDetails, body) {
  try {
    console.log(userDetails);
    const result = await new Promise((resolve, reject) => {
      if (body.segment_id === "") {
        body.segment_id = null;
      }
      if (body.schedule_date === "") {
        body.schedule_date = null;
      }
      if (body.list_id === "") {
        body.list_id = null;
      }
      if (body.schedule_time === "") {
        body.schedule_time = null;
      }
      if (body.schedule_daily_limit === "") {
        body.schedule_daily_limit = null;
      }
      if (body.schedule_timezone_id === "") {
        body.schedule_timezone_id = null;
      }
      if (body.email_days_id === "") {
        body.email_days_id = null;
      }
      db.query(
        "CALL sp_createCampaign( ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          userDetails.companyId,
          body.campaign_name,
          body.segment_id,
          body.list_id,
          body.from_user_id,
          body.template_id,
          body.send_immediately,
          body.schedule_date,
          body.schedule_time,
          body.schedule_timezone_id,
          body.schedule_daily_limit,
          userDetails.user_id,
          body.cc,
          body.bcc,
          body.subject,
          body.isEmailTrackingEnabled,
          body.is_neverExpire,
          body.is_approvalRequire
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
    return result; // Return the result here
  } catch (err) {
    throw err;
  }
}
module.exports = campaignModel;
