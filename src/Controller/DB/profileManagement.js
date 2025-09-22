const dbConn = require("../../../config/db.config").promise();
const { verifyJwt } = require("../../Controller/jwtAuth");
const { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
require("dotenv").config();
var nodemailer = require("nodemailer");
const dbConnection=require("../../middleware/dbConnection");
const axios = require('axios');

function generateRandomString() {
  const numbers = '0123456789';
  const alphabets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let randomString = '';

  for (let i = 0; i < 2; i++) {
      randomString += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  for (let i = 0; i < 2; i++) {
      randomString += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
  }

  return randomString;
}


exports.requestForGetPassword = async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).send({ errors: errors.array() });
    }

    const [rowList] = await dbConnection(res,"USP_GET_DETAILS_FOR_REQUEST_UPDATE_PASSWORD(?)",[req.body.email])
      console.log(rowList,"row")
      if(rowList.length == 0){
        return res.status(400).send({
          message: "Invalid email! No such user exists!",
        });
      }

      const randomCode = generateRandomString();
          await dbConnection(res,"USP_INSERT_FORGOT_PASSWORD_DETAILS(?,?)",[randomCode,rowList[0][0].user_id]);


    await sendMailVerificationMail(rowList[0][0].email,'Email Reset Code','Your Email Reset Code is :'+randomCode,rowList[0][0].full_name,randomCode);

    return res.status(200).send({
      message: "Password reset code has been sent to your email.",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}





exports.resetPassword = async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).send({ errors: errors.array() });
    }

    const [rowList] = await dbConnection(res,"USP_GET_RESET_PASSWORD_DETAILS(?)",[req.body.code]);
     console.log(rowList,"list");
      if(rowList.length == 0){
        return res.status(400).send({
          message: "Invalid code!",
        });
      }

    const hashPass = await bcrypt.hashSync(req.body.password, 12);

  //await dbConnection(res,"USP_UPDATING_EXISTING_RECORD(?)",[rowList[0][0].forget_password_user_id]);

  await dbConnection(res,"USP_RESET_PASSWORD_DETAILS(?,?)",[hashPass,rowList[0][0].forget_password_user_id]);

    return res.status(200).send({
      message: "Password reset successfully!",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}




exports.getProfileOverview = async (req, res, next) => {

  try {

    const userDetails = verifyJwt(req);
    const [rowList] = await dbConnection(res,"USP_GET_PROFILE_OVERVIEW(?)",[userDetails.user_id])


    return res.status(200).send({
      message: "User overview !",
      data:rowList[0]
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}



exports.editProfile = async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).send({ errors: errors.array() });
    }

    const userDetails = verifyJwt(req);

    const rowList = await dbConn.query(
      "call sp_update_registered_user(?,?,?,?)",
      [
        userDetails.email,
        req.body.name,
        req.body.phone,
        userDetails.user_id
      ]
    );

    // console.log("vv",rowList[0]);
    
    return res.status(200).send({
      message: "Profile edited successfully !",
      data:rowList
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}



exports.changePassword = async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).send({ errors: errors.array() });
    }

    const userDetails = verifyJwt(req);

    const [rowList] = await dbConn.execute(
      `SELECT password from tbl_users where user_id=? and is_active=1`,
      [userDetails.user_id]);

      if(rowList.length == 0){
        return res.status(400).send({
          message: "Invalid request!",
        });
      }


      const passMatch = await bcrypt.compare(req.body.oldPassword, rowList[0].password);
      // console.log("passMatch",passMatch);

      if (!passMatch) {
        
        return res.status(400).json({
          message: "Incorrect old password.",
          success: false,
        });
      }

    const hashPass = await bcrypt.hashSync(req.body.newPassword, 12);

    await dbConn.execute(
      `UPDATE tbl_users SET password=? where user_id=?`,
      [hashPass,userDetails.user_id]);


    return res.status(200).send({
      message: "Password changed successfull!",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
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

const sendMailVerificationMail = async (to,subject, description, name,code) => {
  try {

    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //   to: to, // Change to your recipient
    //   from: "sqm.client.master@gmail.com", // Change to your verified sender
    //   subject: `${subject}`,
    //   text: `${description}`,
    //   html: `<strong>
    //   Dear ${name}, </strong>
    //   <br>
    //   <p>Your Password reset code is ${code}.
    //   <br>
    //     <br>
    //     Thank you,<br>
    //     Mail Blitz
    //   `,
    // };

    // await sgMail.send(msg);
       let body= `<strong>
      Dear ${name}, </strong>
      <br>
      <p>Your Password reset code is ${code}.
      <br>
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
      subject: `${subject}`, // Email subject
      html: body, // Email body (plain text)
    };
    // Send email
    // const res = await transporter.sendMail(mailOptions);
    // console.log("Email message sent with message ID:", res.messageId);

    
    await axios.post('https://cylsysapis.cylsys.com/api/v1/sendOTP', {
      subject:subject,
      to: to,
      user_name: name,
      code:code,
    });
    console.log('POST request to the other API endpoint successful');

  } catch (error) {
    throw err;
  }
};