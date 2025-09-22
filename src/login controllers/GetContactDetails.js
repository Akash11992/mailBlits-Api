const dbConn = require('./../../config/db.config').promise();


exports.GetContactDetails = async (req, res, next) => {
        try {
          const [row_a] = await dbConn.execute(
            'SELECT con_id AS id, con_email AS email FROM `sqm_contact` WHERE con_company_id=? AND con_is_active=1 AND con_is_deleted=0',
            [req.body.companyId]
          );
          if (row_a.length > 0) {
            return res.status(200).send({
              success: true,
              error: false,
              message: "Contacts fetched successfully",
              data: row_a,
            });
          } else {
            return res.status(200).send({
              success: true,
              error: false,
              message: "Contact list empty for this company.",
            });
          }
        } catch (err) {
          console.log("err...", err);
          next(err);
        }
      };

      exports.Get_TodayContactDetails = async (req, res, next) => {
        try {
          console.log("execute....");
          const [row_a] = await dbConn.execute(
            // "SELECT * FROM `tbl_contactdetails` WHERE `created_Date`= ?",
            'call sendquickmail_db.Get_TodayContactDetails(?)',
            [req.body.created_Date]
          );
          console.log("tbl_contactdetails..............", row_a);
          if (row_a.length > 0) {
            return res.json({
              success: "true",
              message: "created_Date matched Successfully",
              data: row_a,
              //////----------------------------------------
            });
          } else {
            return res.json({
              status: 404,
              message: "Invalid created_Date ",
            });
          }
        } catch (err) {
          console.log("err...", err);
          next(err);
        }
      };

      exports.GetContactEmails = async (req, res, next) => {
        try {
          const [row_a] = await dbConn.execute(
            // "SELECT * FROM `tbl_contactdetails` WHERE `company_Id`= ?",
            'call sendquickmail_db.Get_contactemail(?)',
            [req.body.company_Id]
          );
          console.log("tbl_contactdetails..............", row_a);
          if (row_a.length > 0) {
            return res.json({
              success: "true",
              message: "contact_Email matched Successfully",
              data: row_a[0],
            });
          } else {
            return res.json({
              status: 404,
              message: "Invalid company Id ",
            });
          }
        } catch (err) {
          console.log("err...", err);
          next(err);
        }
      };