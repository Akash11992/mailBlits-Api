const bcrypt = require("bcryptjs");
const dbConn = require('../../config/db.config').promise();

exports.NewCampaign = async (req, res, next) => {
    try {
        let [temp] = await dbConn.execute(
            "SELECT 1 FROM `tbl_users` WHERE `user_id`=?",
            [req.body.userId],
        );
        if (temp.length === 0) {
            return res.status(200).send({
                message: "Invalid UserId",
                error: true,
                success: false,
            });
        }
        temp = [];
        [temp] = await dbConn.execute(
            "SELECT 1 FROM `sqm_reg_companies` WHERE `rc_id`=?",
            [req.body.companyId],
        );
        if (temp.length === 0) {
            return res.status(200).send({
                message: "Invalid CompanyId",
                error: true,
                success: false,
            });
        }
        let hashPass = "";
        hashPass = await bcrypt.hashSync(req.body.senderPassword, 12);
        let clientSecretHash = "";
        if (req.body.clientSecret) {
            clientSecretHash = await bcrypt.hashSync(req.body.clientSecret, 12);
        }
        // console.log(req.body.campaignId,
        //     req.body.companyId,
        //     req.body.userId,
        //     req.body.subject,
        //     req.body.sentTo,
        //     req.body.body,
        //     req.body.templateId,
        //     req.body.date,
        //     req.body.time,
        //     req.body.timezone,
        //     req.body.isBatch,
        //     req.body.batchId,
        //     req.body.toName,
        //     req.body.senderEmail,
        //     hashPass,
        //     req.body.senderId,
        //     req.body.emailProvider,
        //     req.body.host,
        //     req.body.isFromNew,
        //     req.body.port,
        //     req.body.sslOption,
        //     req.body.tenantId,
        //     clientSecretHash,
        //     req.body.clientId,
        //     req.body.userId,req.body.isMasterTemp);

        const [rows] = await dbConn.execute(
            'call create_campaign(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [
                req.body.campaignId,
                req.body.companyId,
                req.body.userId,
                req.body.subject,
                req.body.sentTo,
                req.body.body,
                req.body.templateId,
                req.body.date,
                req.body.time,
                req.body.timezone,
                req.body.isBatch,
                req.body.batchId,
                req.body.toName,
                req.body.senderEmail,
                hashPass,
                req.body.senderId,
                req.body.emailProvider,
                req.body.host,
                req.body.isFromNew,
                req.body.port,
                req.body.sslOption,
                req.body.tenantId,
                clientSecretHash,
                req.body.clientId,
                req.body.userId,
                req.body.isMasterTemp,
            ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                success: true,
                error: false,
                message: "The campaign has been successfully inserted.",
                data: rows,
            });
        }
        return res.json({
            success: true,
            error: false,
            message: "Operation could not be performed successfully",
        });

    }
    catch (err) {
        next(err);
    }
};


exports.UpdateCampaign = async (req, res, next) => {
    try {
        const [row] = await dbConn.execute(
            // "SELECT * FROM `users` WHERE `Email`=?",

            "SELECT * FROM `invite_users` WHERE `UserId`=?",
            [req.body.UserId],
        );

        if (row.length === 0) {
            // return res.status(422).json({
            return res.json({
                message: "Invalid UserId",
            });
        }
        const [row1] = await dbConn.execute(
            "SELECT * FROM `company_ragistration` WHERE `company_Id`=?",
            // 'call sendquickmail_db.GetCompanyId(?)',
            [req.body.company_Id],

        );

        if (row1.length === 0) {
            // return res.status(422).json({
            return res.json({
                message: "Invalid company_Id ",
            });
        }

        const [row2] = await dbConn.execute(
            "SELECT * FROM `tbl_template` WHERE `template_Id`=?",
            //   'call sendquickmail_db.GetCompanyId(?)',
            [req.body.template_Id],

        );

        if (row2.length === 0) {
            // return res.status(422).json({
            return res.json({
                message: "Invalid template_Id ",
            });
        }

        let clientSecretHash, hashPass;
        if (req.body.clientSecret) {
            clientSecretHash = await bcrypt.hash(req.body.clientSecret, 12);
        }
        if (req.body.senderPassword) {
            hashPass = await bcrypt.hash(req.body.senderPassword, 12);
        }

        // console.log("Param list: ", req.body.ToName,
        //     req.body.sentTo,
        //     req.body.ToCC,
        //     req.body.ToBCC,
        //     req.body.Subject,
        //     req.body.template_Id,
        //     req.body.senderEmail,
        //     hashPass,
        //     req.body.Date,
        //     req.body.Time,
        //     req.body.Timezone,
        //     req.body.company_Id,
        //     req.body.UserId,
        //     req.body.campaign_Id,
        //     clientSecretHash,
        //     req.body.emailProvider,
        //     req.body.host,
        //     req.body.isFromNew,
        //     req.body.port,
        //     req.body.sslOption,
        //     req.body.tenantId,
        //     req.body.clientId)
        const [rows] = await dbConn.execute(

            // "UPDATE tbl_createcampaign SET `ToName` = ?, `sentTo` = ?, `ToCC` = ?, `ToBCC` = ?, `Subject` = ?, `template_Id` = ?, `senderEmail` = ?,`senderPassword`= ?, `Date` = ? ,`Time` = ?,`Timezone` = ?,`company_Id` = ?,`UserId` = ? WHERE `id` = ?",
            'call sendquickmail_db.Update_NewCampaign(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',

            [
                req.body.ToName,
                req.body.sentTo,
                req.body.ToCC,
                req.body.ToBCC,
                req.body.Subject,
                req.body.template_Id,
                req.body.senderEmail,
                hashPass,
                req.body.Date,
                req.body.Time,
                req.body.Timezone,
                req.body.company_Id,
                req.body.UserId,
                req.body.campaign_Id,
                clientSecretHash,
                req.body.emailProvider,
                req.body.host,
                req.body.isFromNew,
                req.body.port,
                req.body.sslOption,
                req.body.tenantId,
                req.body.clientId,
            ]);


        // console.log('message', rows)


        return res.json({
            success: true,
            message: "The Camapaign has been successfully Updated",
            data: rows,
        });

    }
    catch (err) {
        next(err);
    }
};


exports.getAllCampaign = async (req, res, next) => {
    try {
      console.log("getAllCampaign....");
      const [row_a] = await dbConn.execute(
        "SELECT * FROM `tbl_createcampaign`",
        []
      );
      if (row_a.length > 0) {
        return res.json({
          success: "true",
          message: "List of All Campaign",
          data: row_a,
        });
      } else {
        return res.json({
          message: "No data found",
        });
      }
    } catch (err) {
      console.log("err...", err);
      next(err);
    }
  };

  exports.GetCampaignByUserId = async (req, res, next) => {
    try {
      console.log("execute....");
      const [row_a] = await dbConn.execute(
        "SELECT * FROM `tbl_createcampaign` WHERE `UserId`= ?",
        // 'call sendquickmail_db.Get_contactemail(?)',
        [req.body.UserId]
      );
    //   console.log("UserId..............", row_a);
      if (row_a.length > 0) {
        return res.json({
          success: "true",
          message: "UserId matched Successfully",
          data: row_a,
        });
      } else {
        return res.json({
          status: 404,
          message: "Invalid UserId ",
        });
      }
    } catch (err) {
      console.log("err...", err);
      next(err);
    }
  };

exports.GetBatchMaster = async (req, res, next) => {
    try {
        const [row] = await dbConn.execute('SELECT bm_id AS id, CONCAT(bm_count_lo, "-", bm_count_up) AS name FROM `sqm_batch_master` WHERE bm_is_active=1 AND bm_is_deleted=0',)
        if (!row) {
            return res.status(200).send({
                success: false,
                error: true,
                message: "Something went wrong while fetching Batch details."
            });
        }
        if (row.length === 0) {
            return res.status(200).send({
                success: true,
                error: false,
                message: "Batch details fetched successfully. No records found.",
            });
        }
        return res.status(200).send({
            success: true,
            error: false,
            message: "Batch details fetched successfully",
            data: row,
        });
    }
    catch (e) {
        console.error(e);
        next(e);
    }
};
