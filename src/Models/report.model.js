const { log } = require("handlebars/runtime");
const db = require("../../config/db.config");

const dbConn = require("../../config/db.config").promise();


const reportModel = {
  // getEmailAnalytics: async (userDetails) => {
  //   try {
  //     const result = await new Promise((resolve, reject) => {
       
  //       db.query(
  //         "CALL sp_getAllSchedulerDetailsByCid(?)",
  //         [userDetails.companyId],
  //         (err, result) => {
  //           if (err) {
  //             console.error(err);
  //             reject(err);
  //           } else {
  //             // console.log(result);
  //             resolve(result);
  //           }
  //         }
  //       );
  //     });

  //     return result;
  //   } catch (err) {
  //     throw err;
  //   }
  // },

  getEmailAnalytics: async (companyId,fromDate,toDate) => {
    try {

      console.log(companyId)
      console.log(fromDate)
      console.log(toDate)

      let finalRows = [];
  
        const [rows] = await dbConn.execute(
          "SELECT campaign_id,campaign_name FROM tbl_campaign WHERE company_id=? AND created_at < ? and created_at > ?",
          [companyId,toDate,fromDate]
        );

        console.log("rows")
        console.log(rows)
        

        if(rows.length >0){
          console.log('inns')

          const campaignIds = rows.map(obj => obj.campaign_id).join(',');

          console.log(campaignIds)
        
          const [ruleRows] = await dbConn.execute(
            `SELECT email_date,campaign_id,email_status,user_status
            FROM tbl_email_scheduler_rule_for_campaign tc
             INNER JOIN tbl_user_status us ON tc.user_status_id = us.tbl_user_status_id
             INNER JOIN tbl_email_status es ON tc.email_status_id = es.email_status_id
             WHERE campaign_id IN (${campaignIds}) `,
            [companyId,toDate]);

            // console.log(ruleRows)


            for(let campaign of rows){

              let campaignRules = [];

              let openedCount = 0;
              let unopenedCount = 0;
              
              for(let rule of ruleRows){
                if(campaign.campaign_id = rule.campaign_id){
                  campaignRules.push(rule)
                  if(rule.user_status == 'Unopened'){
                    unopenedCount = unopenedCount+1;
                  }
                  if(rule.user_status == 'Open'){
                    openedCount = openedCount+1;
                  }
                }
              }

              const dateNumbers = campaignRules.map(date => date.email_date.getTime());

              const fromDate = Math.min(...dateNumbers);
              const toDate = Math.max(...dateNumbers);

              finalRows.push({campaignName:campaign.campaign_name,fromDate:new Date(fromDate),toDate:new Date(toDate),openedCount,unopenedCount})

            }
        }
      
      return finalRows;
    } catch (err) {
      throw err;
    }
  },
  // getSentEmailStatus: async (companyId,fromDate,toDate) => {
  //   try {

  //     console.log(companyId)
  //     console.log(fromDate)
  //     console.log(toDate)

  //     let finalRows = [];
  
  //       const [rows] = await dbConn.execute(
  //         `SELECT email_id, ToEmailID,mail_send_time,email_status,remarks 
  //         FROM tblemailsentlogs tes 
  //         INNER JOIN tbl_email_scheduler_rule_for_campaign tc ON tes.scheduler_rule_id = tc.scheduler_rule_id
  //         INNER JOIN tbl_mailbox tm ON tc.mailbox_id = tm.mailbox_id
  //          WHERE company_id=? AND mail_send_time < ? and mail_send_time > ?`,
  //         [companyId,toDate,fromDate]
  //       );

  //       console.log("rows")
  //       console.log(rows)

  //       for(let row of rows){
  //         finalRows.push({
  //           fromMail:row.email_id,
  //           toEmailId:row.ToEmailID,
  //           mailSendTime:row.mail_send_time,
  //           emailStatus:row.email_status,
  //           remarks:row.remarks,
  //         })
  //       }
       
      
  //     return finalRows;
  //   } catch (err) {
  //     throw err;
  //   }
  // },


    getSentEmailStatus: async (companyId,fromDate,toDate,campaign_id) => {
      try {
        const result = await new Promise((resolve, reject) => {
          db.query(
            "CALL sp_sent_mail_status_report(?,?,?,?)",
            [companyId,fromDate,toDate,campaign_id],
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
  getBounceEmailStatus: async (companyId,fromDate,toDate,campaign_id) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_bounce_mail_status_report(?,?,?,?)",
          [companyId,fromDate,toDate,campaign_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log("hii",result);
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
getEmailAnalytics: async (companyId,fromDate,toDate,campaign_id) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_GetEmailAnalytics(?,?,?,?)",
        [companyId,fromDate,toDate,campaign_id],
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
};
module.exports = reportModel;
