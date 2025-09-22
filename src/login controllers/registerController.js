const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const conn = require("./../../config/db.config").promise();
var nodemailer = require("nodemailer");
const express = require("express");
const app = express();
app.use(express.json());
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const { log } = require("async");
require("dotenv").config();
const saltRounds = 10;
const myPlaintextPassword = "Cylsys@2";
const someOtherPlaintextPassword = "not_bacon";
const axios = require('axios');
const dbConnection=require("../middleware/dbConnection");
exports.register = async (req, res, next) => {
  let apiurl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/`;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).send({ errors: errors.array() });
  }

  try {
    const email = req.body.Email;
    const domain = email.match(/@(.+)/)[1];

    const [domainRecord] = await dbConnection(res,"USP_DOMAIN_RECORDS(?)",[`${domain}`]);
    console.log(domainRecord,"domainRrecord");
    if (domainRecord[0]?.length > 0) {
      return res.status(400).json({
        message: "Please Contact Admin !",
        success: false,
      });
    }

    const [rowFindUser] = await dbConnection(res,"USP_REGISTER_EMAIL_EXISTS_CHECK(?)", [req.body.Email]);
    console.log(rowFindUser[0],"rowFindUser");
    if (rowFindUser[0]?.length > 0) {
      return res.status(400).json({
        message: "Email is already registered !",
        success: false,
        code: 400,
      });
    }


    const hashPass = await bcrypt.hashSync(req.body.Password, 12);
    if (req.body.is_individual === "") {
      req.body.is_individual = null;
    }

    const [rows] = await conn.query(
      "call sp_registerUser(?,?,?,?,?,?,?)",
      [
        req.body.Name,
        req.body.Email,
        hashPass,
        req.body.designationId ||null,
        req.body.phone || null,
        req.body.is_individual,
        'c'  //create action for audit
      ]
    );

    // console.log(rows[0][0].insertedId);
    
    if (req.body.is_individual == true) {
      let company_domain = null;

      let company_email = req.body.Email;
      const atIndex = company_email.indexOf("@");
      company_domain = company_email.substring(atIndex);

      console.log(company_domain);

      let finalPath = "src/uploads/product_logo.svg";

      const [Companyrows] = await conn.query(
        "call sp_create_company (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          req.body.is_individual,
          '--',
          req.body.Email,
          req.body.phone || null,
          '--',
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          '--',
          rows[0][0].insertedId,
          null,
          finalPath,
          'c',
          null,
        false,
        null       
        ]
      );

      if (Companyrows[0] && Companyrows[0][0].response === "success") {
        // console.log(Companyrows[2][0]);

        await conn.query("call sp_update_company_id_Inreg_users(?,?,?)", [
          Companyrows[2][0].company_id,
          rows[0][0].insertedId,
          Companyrows[2][0].group_name,

        ]);

        await conn.query("call sp_update_logourl_Incompanyregistration(?,?)", [
          Companyrows[2][0].company_id,
          finalPath,
        ]);

        await conn.query("call sp_update_role_id_Inreg_users(?,?)", [
          Companyrows[2][0].company_id,
          Companyrows[1][0].role_id,
        ]);

        console.log("The company details has been successfully inserted.");
      }
    }
    // end
    
      await sendMailVerificationMail(
        req.body.Email,
        "Email Verification From MailBlitz!",
        rows[0][0].insertedId,
        req.body.Name,
        apiurl,
        res
      );


      await sendMailVerificationMailToAdmin(
        req.body,
        rows[0][0].insertedId,
        apiurl,
        res
      );
    

    res.status(201).send({
      message: "User has been Created",
      Data: rows[0],
      success: true,
      error:false
    });

  } catch (err) {
    next(err);
  }
};

exports.verifyMail = async (req, res, next) => {
  try {
    let { userId, uniqueString } = req.params;

    const [rowFindUser] = await dbConnection(res,"USP_GET_VERIFY_DETAILS_BY_USER(?)",[userId]);
    console.log(rowFindUser,"user");

    if (rowFindUser[0]?.length > 0) {

      const { user_verification_expiresIn,user_verification_uniqueString } = rowFindUser[0][0];
console.log(rowFindUser[0]);
      console.log(uniqueString,user_verification_uniqueString);
      if(uniqueString != user_verification_uniqueString){
        return res.status(401).send({message:"Unauthorized access"})
      }

        await dbConnection(res,"USP_VERIFY_UPDATE_USER_DETAILS_VERIFIED(?)",[userId]);

        res.status(200).send(`Account Verified Successfully!`);
      
    } else {
      return res.status(400).send(`Link Not Valid!`);
    }
  } catch (err) {
    next(err);
  }
};


exports.verifyMailByAdmin = async (req, res, next) => {
  try {
    let { userId, uniqueString } = req.params;


    const [rowFindUser] = await dbConnection(res,"USP_GET_ADMIN_DETAILS_FOR_VERIFICATION(?)",[userId])
    console.log(rowFindUser,"admin check points");
    const { user_verification_expiresIn,admin_verification_uniqueString } = rowFindUser[0][0];

    if(uniqueString != admin_verification_uniqueString){
      return res.status(401).send({message:"Unauthorized access"})
    }

    if (rowFindUser?.length > 0) {

      const { admin_verification_expiresIn } = rowFindUser[0][0];

      // if (Date.now() < admin_verification_expiresIn) {

        await dbConnection(res,"USP_VERIFY_UPDATE_ADMIN_DETAILS_VERIFIED(?)",[userId])

        res.status(400).send(`<p>Account Verified Successfully!</p>`);
      // } else {
      //   res.status(400).send(`<p>Verification Link Expired</p>`);
      // }
    } else {
      return res.status(400).send(`Link Not Valid!`);
    }
  } catch (err) {
    next(err);
  }
};

// const sendMailVerificationMail = async (to, description, userId, name) => {
//   try {
//     const currentUrl = process.env.URL;
//     const uniqueString = uuidv4() + userId;

//     bcrypt.hash(uniqueString, saltRounds, async function (err, hashedString) {
//       const [rows] = await conn.execute(
//         "INSERT INTO `tbl_user_verification`(`user_verification_refUserId`,`user_verification_uniqueString`,`user_verification_expiresIn`) VALUES (?,?,?)",
//         [userId, hashedString, Date.now() + 21600000]
//       );
//     });

//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//       to: to, // Change to your recipient
//       from: "sqm.client.master@gmail.com", // Change to your verified sender
//       subject: `${description}`,
//       text: `${description}`,
//       html: `<strong>
//       Dear ${name}, </strong>
//       <br>
//       <p>Thank you for registering with us. To complete your registration, please click on the link below to verify your email address:
//       <br>
//       <a href="${currentUrl}user/verify/${userId}/${uniqueString}">here</a> to proceed</p>
//         <br>
//         Thank you,<br>
//         Mail Blitz
//       `,
//     };

//     await sgMail.send(msg);
//   } catch (error) {
//     throw err;
//   }
// };
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.AuthMail, // Your email address
    pass: process.env.AuthPass, // Your email password or app-specific password
  },
});



const sendMailVerificationMailToAdmin = async (payload,userId,apiurl,res) => {
  console.log(res,"check");
  try {

    const currentUrl = apiurl;
    const uniqueString = uuidv4() + userId;

      const [rows] = await dbConnection(res,"USP_INSERT_ADMIN_VERIFICATION(?,?,?)",[userId, uniqueString, Date.now() + 21600000]);

    let body = `<strong>
      Dear Admin, </strong>
      <br>
      <p>A user account requires activation in our system.</p>
  <br>
  <strong>User Details:</strong>
  <br>
  <ul>
    <li><strong>Name:</strong> ${payload.Name}</li>
    <li><strong>Email:</strong> ${payload.Email}</li>
    <li><strong>Phone:</strong> ${payload.phone}</li>
  </ul>
  <br>

  <p>Please review the user's details and approve by clicking on following link :</p>
  <br>
      <a href="${currentUrl}admin/verify/${userId}/${uniqueString}">click here</a> to proceed</p>
        <br>
        <br>
        Thank you,<br>
        Mail Blitz<br>
        +91 9967502270<br>
        reachus@cylsys.com
      `;

    // Email data
    const mailOptions = {
      from: process.env.AuthMail,
      to: process.env.AdminMail, 
      subject: `Activation Request for User Account`, 
      html: body, 
    };

    const res1 = await transporter.sendMail(mailOptions);
    console.log("Email message sent with message ID:", res1.messageId);
  } catch (error) {
    throw error;
  }
};

const sendMailVerificationMail = async (
  to,
  description,
  userId,
  name,
  apiurl,
  res
) => {
  try {
    console.log("apiurl", apiurl);
    
    const currentUrl = apiurl;
    const uniqueString = uuidv4() + userId;

      console.log("hashedString")
      console.log(uniqueString)

      const [rows] =  await dbConnection(res,"USP_INSERT_SEND_MAIL_VERIFICATION(?,?,?)",[userId, uniqueString, Date.now() + 21600000]);
 

    let body = `<strong>
      Dear ${name}, </strong>
      <br>
      <p>Thank you for registering with us. To complete your registration, please click on the link below to verify your email address:
      <br>
      <a href="${currentUrl}user/verify/${userId}/${uniqueString}">click here</a> to proceed</p>
        <br>
        Thank you,<br>
        Mail Blitz<br>
        +91 9967502270<br>
        reachus@cylsys.com
      `;

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
      subject:"Email Verification From MailBlitz!",
      to: to,
      user_name: name,
      currentUrl: currentUrl,
      userId: userId,
      uniqueString: uniqueString,
    });

    console.log('POST request to the other API endpoint successful');
  } catch (error) {
    throw error;
  }
};




