const dbConn = require('../../../config/db.config').promise();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const secretKey = process.env.SECRET_KEY;
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator");
const { verifyJwt } = require('../jwtAuth')
require("dotenv").config();
var nodemailer = require("nodemailer");
const axios = require('axios');
const dbConnection=require("../../middleware/dbConnection");

exports.GetRoles = async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    let group_name = null;
    if (userDetails.is_group_company) {
      group_name = userDetails.group_name;
    }

    const [roleRow] = await dbConn.query("call sp_getRole(?,?)", [group_name, userDetails.companyId]);

    if (roleRow.length == 0) {
      return res.status(400).send({
        message: "No Roles Found!",
      });
    }

    return res.status(200).send({
      message: "Roles Fetched!",
      data: roleRow,
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
};

exports.GetSubCompanyRoles = async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);
    let group_name = null;
    if (userDetails.is_group_company) {
      group_name = userDetails.group_name;
    }
    let companyId = req.body.company_id;
    const [roleRow] = await dbConn.query("call sp_getRole_bysubcompanyID(?)", [companyId]);
    if (roleRow.length == 0) {
      return res.status(400).send({
        message: "No Roles Found!",
      });
    }

    return res.status(200).send({
      message: "Roles Fetched!",
      data: roleRow,
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
};


exports.CreateRoles = async (req, res, next) => {

  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Required fields missing!' });
    }

    const userDetails = verifyJwt(req);
    console.log(userDetails, "userDetails");

    // Generate a common cr_id before inserting roles for different companies
    const [maxRoleIdRow] = await dbConn.query("SELECT COALESCE(MAX(cr_id), 0) + 1 AS new_role_id FROM tbl_role_master");
    const commonRoleId = maxRoleIdRow[0].new_role_id;

    const companyIds = req.body.companyIds;
    const promises = companyIds.map(async (companyId) => {
      const [roleRow] = await dbConn.query(
        "call sp_create_role(?,?,?,?,?,?)",
        [req.body.roleName, req.body.description, companyId, userDetails.group_name, userDetails.user_id, commonRoleId]
      );
      return roleRow;
    });

    // Wait for all queries to finish
    const results = await Promise.all(promises);

    // Check if any query resulted in zero affected rows (indicating the role already exists)
    const failedInserts = results.filter(result => result.affectedRows === 0);

    if (failedInserts.length > 0) {
      return res.status(400).send({
        message: `${failedInserts.length} Role(s) Already Exists!`,
      });
    }

    return res.status(200).send({
      message: "Roles Added Successfully!"
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};


exports.UpdateRoles = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Required fields missing!' });
    }

    const userDetails = verifyJwt(req);
    const { roleName, description, roleIds, companyIds, commonRoleId } = req.body;

    if (!roleIds || roleIds.length === 0) {
      return res.status(400).json({ message: 'Role IDs are required!' });
    }

    if (!companyIds || companyIds.length === 0) {
      return res.status(400).json({ message: 'Company IDs are required!' });
    }

    // Loop through roleIds

    // Check if this roleId has a corresponding companyId
    for (let i = 0; i < companyIds.length; i++) {
      const companyId = companyIds[i];

      console.log("Company ID:", companyId);

      // Call stored procedure for update/insert
      console.log("cm", commonRoleId)
      await dbConn.query(
        "CALL sp_update_role(?,?,?,?,?,?)",
        [userDetails.user_id, roleName, description, companyId, userDetails.group_name, commonRoleId]
      );

    }

    // Retrieve the existing company IDs for the commonRoleId
    const [existingRoles] = await dbConn.query(
      "SELECT company_id FROM tbl_role_master WHERE cr_id = ? AND is_active = 1",
      [commonRoleId]
    );

    const existingCompanyIds = existingRoles.map(role => role.company_id);
    // Identify the company IDs that are not in the current payload but exist in the DB
    const inactiveCompanyIds = existingCompanyIds.filter(id => !companyIds.includes(id));

    // Mark the roles for these inactiveCompanyIds as inactive
    if (inactiveCompanyIds.length > 0) {
      await dbConn.query(
        "UPDATE tbl_role_master SET is_active = 0,created_at = NOW() WHERE cr_id = ? AND company_id IN (?)",
        [commonRoleId, inactiveCompanyIds]
      );
    }

    return res.status(200).send({
      message: "Roles updated/inserted successfully!"
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).send({
      message: err.message
    });
  }
};

exports.DeleteRoles = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Required fields missing!' });
    }

    const userDetails = verifyJwt(req);
    const { roleIds } = req.body;
    console.log(req.body);


    // const roleIds = req.body.roleIds; // Array of role objects with role_id and company_id

    // console.log("body",req.body.roleIds[0]);

    const failedDeletions = [];

    for (let i = 0; i < roleIds.length; i++) {
      const roleId = roleIds[i].roleId;
      const companyId = roleIds[i].companyId;
      const roleName = roleIds[i].roleName;

      // Check if the role is assigned to any users
      const [userRoleRows] = await dbConn.query(
        `call sp_isrole_assigned(?,?)`,
        [roleId, companyId]
      );
      // console.log("checking",userRoleRows[0][0].response)
      // If the role is assigned to users, prevent deletion and log the failed deletion
      if (userRoleRows[0][0].response !== 0) {
        failedDeletions.push({
          roleId,
          companyId,
          roleName,
          message: `This role ${roleName} is assigned to one or more users so cannot be deleted.`
        });
        continue;
      }

      // Mark role as deleted
      const [roleRow] = await dbConn.execute(
        `update tbl_role_master set action='d', is_active=0 , created_at = NOW() where role_id=? and company_id=?`,
        [roleId, companyId]
      );

      if (roleRow.affectedRows == 0) {
        failedDeletions.push({
          roleId,
          companyId,
          roleName,
          message: "No such Role Exists!!"
        });
        continue;
      }
    }


    // Check if there are any failed deletions
    if (failedDeletions.length > 0) {

      return res.status(400).send({
        message: failedDeletions[0].message,
        failedDeletions: failedDeletions,
      });
    }

    return res.status(200).send({
      message: "All roles deleted successfully!"
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
};



exports.CreateUser = async (req, res, next) => {
  let apiurl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/`;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }


  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token 2",
    });
  }

  try {

    const [rowFindUser] = await dbConn.execute('SELECT 1 FROM `tbl_users` WHERE email = ? and is_active=1', [req.body.Email])

    if (rowFindUser?.length > 0) {

      return res.status(400).json({
        message: "Email is already registered !",
        success: false,
        code: 400
      });
    }

    const [rowFindUsername] = await dbConn.execute('SELECT 1 FROM `tbl_users` WHERE email = ?', [req.body.Username])

    if (rowFindUsername?.length > 0) {
      return res.status(400).json({
        message: "Username already exists !",
        success: false,
        code: 400
      });
    }

    const hashPass = await bcrypt.hashSync(req.body.Password, 12);
    const companyId = req.body.company_id === null ? userDetails.companyId : req.body.company_id;

    // console.log("user com",companyId)
    const [rows] =  await dbConnection(res,"USP_CREATE_USER_INSERT_DETAILS(?,?,?,?,?,?,?,?,?)",
      [
        req.body.Name,
        req.body.Email,
        hashPass,
        req.body.designationId,
        req.body.roleId,
        companyId,
        userDetails.user_id,
        'c',
        userDetails.group_name
      ]);

   

    if (rows.affectedRows === 1) {
      await sendMailVerificationMail(req.body.Email, 'Email Verification From MailBlitz!', req.body.Name, apiurl)
    }

    return res.status(201).send({
      message: "User has been Created",
      Data: rows[0],
      success: true,
    });

  }
  catch (err) {
    console.log(err)
    return res.status(500).send({
      message: err.message
    });
  }

}



exports.GetUserByCompany = async (req, res, next) => {

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token 2",
    });
  }
  let group_name = null;
  if (userDetails.is_group_company) {
    group_name = userDetails.group_name;
    console.log("insert");

  }

  const [rowFindUsername] = await dbConn.query('call sp_getUser(?,?)', [group_name, userDetails.companyId])

  return res.status(200).json({
    message: "User list fetched!",
    success: "true",
    error: "false",
    data: rowFindUsername[0].length > 0 ? rowFindUsername[0] : []
  });

}



exports.UpdatePassword = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const storedPasswordHash = rowFindUser[0].password;

    // Compare currentPassword with stored password
    const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
    return res.status(422).json({ errors: errors.array() });
  }

  let token = null;
  let userDetails = null;



  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }


  const hashPass = await bcrypt.hashSync(req.body.password, 12);

  await dbConn.execute('UPDATE `tbl_users` SET password=? WHERE user_id=? AND company_id=?',
    [hashPass, req.body.userId, userDetails.companyId])

  return res.status(200).json({
    message: "User Password updated!"
  });

}




exports.GetUserByUserId = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }


  const [rowFindUser] = await dbConn.execute('SELECT ru.user_id as userId,ru.full_name AS username,ru.email AS userEmail, ru.password AS password ,ru.designation AS designationId, ru.role_id AS roleId, ru.is_active AS isActive,ru.company_id, r.role_name AS roleName, sdm.dm_name AS designation FROM `tbl_users` ru JOIN `tbl_role_master` r ON ru.role_id = r.role_id JOIN tbl_designation_master sdm ON dm_id=ru.designation  WHERE ru.user_id = ?',
    [req.body.userId])

  return res.status(200).json({
    message: "User fetched!",
    data: rowFindUser
  });

}



exports.UpdateUser = async (req, res, next) => {
  let apiurl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/`;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  let userId = null;
  let userEmail = null;

  try {

    const [userExists] = await dbConn.execute('SELECT user_id AS userId,email as userEmail FROM `tbl_users` WHERE company_Id = ? AND user_id = ? and is_active=1',
      [req.body.company_id, req.body.userId])

    if (userExists.length > 0) {
      userId = userExists[0].userId,
        userEmail = userExists[0].userEmail
    } else {
      res.status(401).send({
        message: 'User not found'
      });
    }

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }

  try {
    const companyId = req.body.company_id === null ? userDetails.companyId : req.body.company_id;


      await dbConnection(res,"USP_UPDATE_USER_DETAILS(?,?,?,?,?,?,?)",
      [
        req.body.Name,
        req.body.Email,
        req.body.designationId,
        req.body.roleId,
        companyId,
        'u',
        req.body.userId
      ]);

    if (userEmail !== req.body.Email) {
      console.log("not verified!")

      await dbConn.execute(`UPDATE tbl_users set action='u',is_email_verified=0,created_at=NOW() WHERE user_id=?`,
        [
          req.body.userId]);

      await sendMailVerificationMail(req.body.Email, 'Email Verification From MailBlitz!', req.body.userId, req.body.Name, apiurl)
    }

    return res.status(201).send({
      message: "User has been Updated",
      success: true,
    });

  }
  catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
}




exports.DeleteUser = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  try {

    // await dbConn.execute('DELETE FROM `tbl_users` WHERE ru_id=? AND ru_ref_company_Id=?',
    await dbConn.execute(`update tbl_users set action='d' , is_active=0,created_at = NOW() WHERE user_id=?`,
      [req.body.userId]);

    res.status(201).send({
      message: "User has been deleted"
    });

  }
  catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
}



exports.UpdateSelfPassword = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  try {

    const [userRow] = await dbConn.execute('SELECT password FROM `tbl_users` WHERE user_id=? AND company_id=? and is_active=1',
      [
        userDetails.user_id,
        userDetails.companyId
      ]);


    if (userRow.length == 0) {
      return res.status(401).json({
        message: "No such user found!.",
        success: false,
      })
    }


    const passMatch = await bcrypt.compare(req.body.oldPassword, userRow[0].password);
    if (!passMatch) {

      return res.status(400).json({
        message: "Incorrect old password.",
        success: false,
      })
    }


    const hashPass = await bcrypt.hashSync(req.body.newPassword, 12);


    await dbConn.execute(`UPDATE tbl_users SET password=?,action='u',created_at = NOW() WHERE user_id=? AND company_id=?`,
      [
        hashPass,
        userDetails.user_id,
        userDetails.companyId
      ]);


    res.status(201).send({
      message: "Password Changed Successfully!"
    });

  }
  catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
}



const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.AuthMail, // Your email address
    pass: process.env.AuthPass, // Your email password or app-specific password
  },
});
const sendMailVerificationMail = async (to, description, name, apiurl) => {
  
  const [lastId] = await dbConn.execute(
    'SELECT user_id AS lastInsertedId FROM tbl_users WHERE email = ? AND is_active = ?',
    [
      to,
      1
    ]
  );
  
  try {
    const currentUrl = apiurl;
    const uniqueString = uuidv4() + lastId[0].lastInsertedId;


    // bcrypt.hash(uniqueString, 10, async function(err, hashedString) {

    //   await dbConn.execute('INSERT INTO `tbl_user_verification`(`user_verification_refUserId`,`user_verification_uniqueString`,`user_verification_expiresIn`) VALUES (?,?,?)',
    //   [
    //     userId,
    //     hashedString,
    //     Date.now()+21600000
    //   ]);
    // });

    await dbConn.execute('INSERT INTO `tbl_user_verification`(`user_verification_refUserId`,`user_verification_uniqueString`,`user_verification_expiresIn`) VALUES (?,?,?)',
      [
        lastId[0].lastInsertedId,
        uniqueString,
        Date.now() + 21600000
      ]);
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // const msg = {
    //   to: to, // Change to your recipient
    //   from: 'sqm.client.master@gmail.com', // Change to your verified sender
    //   subject: `${description}`,
    //   text: `${description}`,
    //   html: `<strong>
    //   Dear ${name}, </strong>
    //   <br>
    //   <p>Thank you for registering with us. To complete your registration, please click on the link below to verify your email address:
    //   <br>
    //   <a href="${currentUrl}user/verify/${userId}/${uniqueString}">here</a> to proceed</p>
    //     <br>
    //     Thank you,<br>
    //     Send Quick Mail
    //   `
    // }

    //  await sgMail.send(msg);

    let body = `<strong>
      Dear ${name}, </strong>
      <br>
      <p>Thank you for registering with us. To complete your registration, please click on the link below to verify your email address:
      <br>
      <a href="${currentUrl}user/verify/${lastId[0].lastInsertedId}/${uniqueString}">click here</a> to proceed</p>
        <br>
        Thank you,<br>
        Mail Blitz<br>
        +91 9967502270<br>
        reachus@cylsys.com
      `

    // Email data
    const mailOptions = {
      from: process.env.AuthMail, // Sender's email address
      to: to, // Recipient's email address
      subject: `${description}`, // Email subject
      html: body, // Email body (plain text)
    };
    // Send email
    // const res = await transporter.sendMail(mailOptions);
    // console.log("Email message sent with message ID:", res.messageId);

    // Making HTTP POST request to another API

    await axios.post('https://cylsysapis.cylsys.com/api/v1/user_verification', {
      subject: "Email Verification From MailBlitz!",
      to: to,
      user_name: name,
      currentUrl: currentUrl,
      userId: lastId[0].lastInsertedId,
      uniqueString: uniqueString,
    });
    console.log('POST request to the other API endpoint successful');

  } catch (error) {
    throw error
  }
}





exports.GetRoleById = async (req, res, next) => {


  try {

    const userDetails = verifyJwt(req);

    if (!req.body.roleIds) {
      return res.status(200).json({
        message: 'Invalid request'
      })
    }
    // Extract role IDs and company IDs
    const roleIds = req.body.roleIds.map(role => role.roleId).join(',');
    const companyIds = req.body.roleIds.map(role => role.companyId).join(',');
    const [rows] = await dbConn.execute('CALL sp_GetRoleById(?,?)',
      [
        roleIds, companyIds
      ]);

    return res.status(201).send({
      message: "Role fetched Successully!",
      Data: rows[0],
      success: true,
    });

  }
  catch (err) {
    console.log(err)
    return res.status(500).send({
      message: err.message
    });
  }



}