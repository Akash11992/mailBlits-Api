const dbConn = require('../../config/db.config').promise();
const nodemailer = require('nodemailer');

exports.Campaign = async (req, res, next) => {
  try {
    const [row] = await dbConn.execute(
      "SELECT 1 FROM `tbl_users` WHERE user_id=? AND is_active=1 AND ru_is_deleted=0",
      [req.body.userId],
    );

    if (row.length === 0) {
      // return res.status(422).json({
      return res.status(200).send({
        success: false,
        error: true,
        message: "Invalid User details provided in the request.",
      });
    }

    const [row_c] = await dbConn.execute(
        "SELECT 1 FROM `sqm_reg_companies` WHERE rc_id=? AND rc_is_active=1 AND rc_is_deleted=0",
        [req.body.companyId],
    );

    if (row_c.length === 0) {
      // return res.status(422).json({
      return res.status(200).send({
        success: false,
        error: true,
        message: "Invalid Company details provided in the request.",
      });
    }
    const [row1] = await dbConn.execute("INSERT INTO `sqm_campaign`(`cam_company_id`, `cam_user_id`, `cam_name`, `cam_type_id`, `cam_created_by`) VALUES (?,?,?,?,?)",
        [req.body.companyId,
        req.body.userId,
        req.body.campaignName,
        req.body.templateId,
        req.body.userId]
        );
    console.log("After insert", row1.length, row1.insertId)
    if (row1) {
      // return res.status(422).json({
      return res.status(201).send({
        success: true,
        error: false,
        message: "Successfully created campaign",
        data: {id: row1.insertId}
      });
    }
    return res.status(200).send({
      success: false,
      error: true,
      message: "Something went wrong while creating campaign.",
    });

  }
  catch (err) {
    next(err);
  }
};

///---------------------------------------------------------------------------------

exports.CampaignDetailsEdit = async (req, res, next) => {

  try {

    const [row] = await dbConn.execute(
      // "SELECT * FROM `users` WHERE `Email`=?",
      "SELECT * FROM `invite_users` WHERE `UserId`=?",
      [req.body.UserId],
    );

    if (row.length === 0) {
      return res.json({
        message: "Invalid UserId",
      });
    }
    const [row1] = await dbConn.execute(
      // "SELECT * FROM `company_ragistration` WHERE `company_Id`=?",
      
      'call sendquickmail_db.GetCompanyId(?)',
      [req.body.company_Id],

    );

    if (row1.length === 0) {
      return res.json({
        message: "Invalid company_Id ",
      });
    }

    const [rows1] = await dbConn.execute(
      // "UPDATE tbl_campaign SET `campaign_Name` =?,`template_Id`=?,`campaign_TypeId`=? WHERE `campaign_Id` = ?",
      'call sendquickmail_db.Update_campaign(?,?,?,?)',
      [
        req.body.campaign_Name,
        req.body.template_Id,
        req.body.campaign_TypeId,
        req.body.campaign_Id,
      ]);
    if (rows1.affectedRows === 1) {
      return res.status(201).json({
        message: "The campaign details has been successfully updated.",
        success: true,
        data: req.body,

      });
    }

    return res.json({
      success: row, row1,
      message: "UserId and CompanyId matched Successfully",
    });

  }
  catch (err) {
    next(err);
  }
};

exports.GetCampaignUserId = async (req, res, next) => {
  try {
    const [row_a] = await dbConn.execute(
      'SELECT cam_id AS id, cam_name AS name, cam_template_id AS template, cam_type_id AS campaignTypeId, cam_status AS status, cam_created_at AS createdAt FROM `sqm_campaign` WHERE cam_user_id=? AND cam_company_id=? AND cam_is_active=1 AND cam_is_deleted=0',
      [req.body.userId,
      req.body.companyId]
    );
    if (row_a.length > 0) {
      return res.status(200).send({
        success: true,
        error: false,
        message: "Campaign fetched successfully",
        data: row_a,
      });
    } else {
      return res.status(200).send({
        success: true,
        error: false,
        message: "No campaigns found",
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};

exports.GetCampaignTypes = async (req, res, next) => {
  try {
    const [row_a] = await dbConn.execute(
        'SELECT cm_id AS id, cm_name AS name FROM `sqm_campaign_master` WHERE cm_is_active=1 AND cm_is_deleted=0'
    );
    if (row_a.length > 0) {
      return res.status(200).send({
        success: true,
        error: false,
        message: "Campaign types fetched successfully",
        data: row_a,
      });
    } else {
      return res.status(200).send({
        success: true,
        error: false,
        message: "No campaign types found",
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};

exports.GetCampaignDataByCampaignId = async (req, res, next) => {
  try {
    console.log("execute....");
    const [row_a] = await dbConn.execute(
      'call sendquickmail_db.GetCampaignDataByCampaignId(?)',
      [req.body.campaign_Id]
    );
    console.log("campaign_Id..............", JSON.stringify(row_a));
    if (row_a.length > 0) {
      return res.json({ 
        success: true,
        data: row_a[1],
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "Invalid campaign_Id",
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};

exports.TestEmailCredentials = async (req, res, next) => {
  try {
    if (!nodemailer) {
      return res.status(500).send({success: false, error: true, message: 'Something went wrong while checking email credentials.Could not establish test environment.'});
    }

    let transporter;
    if (req.body.emailProvider && req.body.emailProvider === 2) {
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: req.body.port,
        secure: req.body.sslOpt,
        auth: {
          user: req.body.senderEmail,
          pass: req.body.senderPas,
        },
      });
    }

    if (req.body.emailProvider && req.body.emailProvider === 1) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: 'OAuth2',
          user: req.body.senderEmail,
          pass: req.body.senderPas,
          clientId: req.body.clientId,
          clientSecret: req.body.clientSecret,
          refreshToken: req.body.refreshToken,
        },
      });
    }

    if (!transporter) {
      return res.status(500).send({success: false, error: true, message: 'Something went wrong while checking email credentials. Could not establish Transporter'})
    }

    const mailOptions = {
      from: req.body.username,
      to: 'vaibhav.dounde@cylsys.com',
      subject: 'Check secure connection',
      text: `This is a test email to check your email connections.`,
    };

    await transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("In error block")
        console.error(error);
        return res.status(200).send({ error: true, success: false, message: 'Failed to send mail with given credentials.Please check the credentials.' + error.message });
      }
      console.log("In success block")
      return res.status(200).send({ error: false, success: true, message: 'Connection established successfully.' });
    });
  } catch (err) {
    console.log("In catch block")
    console.log("err...", err);
    next(err);
  }
}