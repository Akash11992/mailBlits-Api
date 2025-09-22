const dbConn = require("../../../config/db.config").promise();
const { verifyJwt,checkTokenExpired } = require("../../Controller/jwtAuth");
const axios = require('axios');
const jwt = require("jsonwebtoken");
const CryptoJS = require('crypto-js');
require('dotenv').config(); 
const secretKey = process.env.SECRET_KEY;


exports.refreshToken = async (req, res, next) => {

  try {

    const email = req.params['email'];

    if(!email){
      return res.status(400).json({ error: 'Provide email !' });
    }

    const [rowList] =  await dbConn.query(
      "SELECT email_id,oAuth_payload from tbl_mailbox where email_id=? and is_active=1",
      [email]
    );


    if(rowList.length == 0){
      return res.status(400).json({ error: 'No such email exists !' });
    }

    if(!rowList[0].oAuth_payload){
      return res.status(400).json({ error: 'Email not linked !' });
    }

    const prev_refresh_token = rowList[0].oAuth_payload.refreshToken;

    console.log("prev_refresh_token",prev_refresh_token)

    const response = await axios.post(`https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: prev_refresh_token,
      redirect_uri: 'https://mailblitz.cylsys.com/linkmail'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    const decodedToken = jwt.decode(access_token);

    const newOauthPayload = {
      token:access_token,
      expiresIn:decodedToken.exp,
      refreshToken:refresh_token,
      expiryDate:formatDate(decodedToken.exp*1000),
      expiryTime:formatTimestamp(decodedToken.exp*1000)
    }

    await dbConn.query(
      "UPDATE tbl_mailbox SET action='u',oAuth_payload=? where email_id=?",
      [JSON.stringify(newOauthPayload),email]
    );


    return res.status(200).json({ token:access_token,expiresIn:decodedToken.exp*1000,expiryDate:newOauthPayload.expiryDate,expiryTime:newOauthPayload.expiryTime });

  } catch (error) {
    console.error('Error refreshing tokens', error);
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
};



const formatDate = (timestamp) => {

  const date = new Date(timestamp);

  const padZero = (num) => (num < 10 ? '0' + num : num);

  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${day}-${month}-${year}`;
};



const formatTimestamp = (timestamp) => {
  console.log("inside")
  const date = new Date(timestamp);

  const padZero = (num) => (num < 10 ? '0' + num : num);

  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
};


exports.getBounceInfo = async (req, res, next) => {

  try {

    const [rowList] =  await dbConn.query(
      `SELECT DISTINCT email_id,tc.mailbox_id,tm.oAuth_payload,provider_id,email_provider_name,last_fetched_at from 
      tbl_campaign tc INNER JOIN tbl_mailbox tm ON tc.mailbox_id=tm.mailbox_id
      INNER JOIN tbl_email_provider ep ON tm.provider_id = ep.email_provider_id
      LEFT JOIN tbl_bounce_check bc ON tc.mailbox_id = bc.mailbox_id
      where tc.is_active=1` );

   let returnObj = [];

   for(let row of rowList){

    if(!row.last_fetched_at){
      row.last_fetched_at = new Date().getTime();
      row.expiryDate = formatDate(new Date().getTime());
      row.expiryTime = formatTimestamp(new Date().getTime());

    }else{
      if(row.last_fetched_at){
        row.last_fetched_at = new Date(row.last_fetched_at).getTime();
        row.expiryDate = formatDate(new Date(row.last_fetched_at).getTime());
        row.expiryTime = formatTimestamp(new Date(row.last_fetched_at).getTime());
      }
    }

    if(row.oAuth_payload){
      delete row.oAuth_payload['refreshToken'];
    }

    returnObj.push({
      emailId:row.email_id,
      provider:row.sqm_email_provider_name,
      providerId:row.provider_id,
      lastFetchedAt:row.last_fetched_at,
      oAuthPayload:row.oAuth_payload,
      lastFetchedDate:row.expiryDate,
      lastFetchedTime:row.expiryTime
    })

    await dbConn.query(`INSERT INTO tbl_bounce_check (mailbox_id, last_fetched_at,action)
    VALUES (?, NOW(),'c')
    ON DUPLICATE KEY UPDATE last_fetched_at = NOW()` ,[row.mailbox_id]);
   }

    return res.status(200).json({ data:returnObj});

  } catch (error) {
    console.error('Error refreshing tokens', error);
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
};

exports.linkMailbox= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    const { code,redirectUri } = req.body;

    console.log("process.env.MICROSOFT_TENANT_ID",process.env.MICROSOFT_TENANT_ID);
    console.log("process.env.MICROSOFT_SECRET",process.env.MICROSOFT_SECRET);

    const response = await axios.post(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      scope: 'https://graph.microsoft.com/.default' 
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = response.data;

    console.log("response",response)

    const decodedToken = jwt.decode(access_token);
    const email = decodedToken.unique_name;

    let expiryDate = formatDate(new Date(decodedToken.exp*1000).getTime());
    let expiryTime = formatTimestamp(new Date(decodedToken.exp*1000).getTime());

        await dbConn.query(
      "call sp_create_mailbox(?,?,?,?,?)",
      [userDetails.companyId, email, JSON.stringify({token:access_token,refreshToken:refresh_token,expiresIn:decodedToken.exp*1000,expiryDate:expiryDate,expiryTime:expiryTime}), req.body.providerId, userDetails.user_id]
    );
    return res.status(200).send({
      message: "Email Linked successfully!",
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}


exports.linkGmail= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    console.log("provider===",req.body.providerId)

    if(!req.body.email || !req.body.oAuthPayload || !req.body.providerId){
      return res.status(400).send({
        message: 'required fields missing !'
      });
    }
    
    const email = req.body.email;
    let oAuthPayload = JSON.stringify(req.body.oAuthPayload)

        await dbConn.query(
      "call sp_create_mailbox(?,?,?,?,?)",
      [userDetails.companyId, email,oAuthPayload , req.body.providerId, userDetails.user_id]
    );
    return res.status(200).send({
      message: "Email Linked successfully!",
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}


exports.UnlinkMailbox= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.mailBoxId){
      return res.status(400).send({
        message: 'id missing!'
      });
    }

    await dbConn.execute(
      // "DELETE FROM tbl_mailbox where mailbox_id=? and company_id=?",
      "update tbl_mailbox set action='d', is_active=0,isLinked=0,created_at = NOW() where mailbox_id=? and company_id=?",
      [req.body.mailBoxId,userDetails.companyId]);

    return res.status(200).send({
      message: "Email un-Linked successfully!",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}




exports.getMailboxList = async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    const [rowList] = await dbConn.execute(
      "SELECT mb.mailbox_id,mb.email_id,mb.provider_id,ep.email_provider_name,mb.created_at,mb.oAuth_payload FROM tbl_mailbox mb INNER JOIN tbl_email_provider ep ON mb.provider_id=ep.email_provider_id where mb.company_id=? and mb.is_active=1",
      [userDetails.companyId]);

      for(let row of rowList){
        row.isLinked = true;
        if(row.provider_id == 2){
          if(row.oAuth_payload){
            if(row.oAuth_payload.token){
              console.log(row.email_id)
              const decoded = jwt.decode(row.oAuth_payload.token, { complete: true });
              row.tokenExpiryDate = new Date(decoded.payload.exp*1000)

              const options = {
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true // Use 12-hour format, set to false for 24-hour format
              };
              row.tokenExpiryDate = row.tokenExpiryDate.toLocaleDateString('en-US', options);

              const isExpred = checkTokenExpired(row.oAuth_payload.token)
              if(isExpred){
                row.isLinked = false;
              }
            }
          }
        }
       delete row['oAuth_payload']
      }


    return res.status(200).send({
      message: "Email List!",
      data:rowList
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}


exports.linkOthermail = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);

    console.log("provider===", req.body.providerId);

    // Check for required fields
    if (!req.body.email || !req.body.providerId) {
      return res.status(400).send({
        message: 'Required fields missing!',
      });
    }

    let password = req.body.password || null;
    if (password) {
      password = CryptoJS.AES.encrypt(password, secretKey).toString(); // Encrypt the password
    }


    const companyId = userDetails.companyId;
    const email = req.body.email;
    const providerId = req.body.providerId;
    const smtpUrl = req.body.smtpUrl || null;
    const smtpPort = req.body.smtpPort || null;
    const imapUrl = req.body.imapUrl || null;
    const imapPort = req.body.imapPort || null;
    const pop3Url = req.body.pop3Url || null;
    const pop3Port = req.body.pop3Port || null;
    const action = 'c';
    const isActive = req.body.isActive || 1;
    const createdBy = userDetails.user_id;

    // await dbConn.query(
    //   "CALL sp_link_other_mail(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    //   [
    //     companyId, email, password, 
    //     providerId, smtpUrl, smtpPort, imapUrl, imapPort,
    //     pop3Url, pop3Port, action, isActive, createdBy
    //   ]
    // );

    await dbConn.query(
      "call sp_create_mailbox(?,?,?,?,?)",
      [userDetails.companyId, email, JSON.stringify({password:password,smtpUrl:smtpUrl,smtpPort:smtpPort,imapUrl:imapUrl,imapPort:imapPort,pop3Url:pop3Url,pop3Port:pop3Port,SSL:'yes'}), req.body.providerId, userDetails.user_id]
    );
    return res.status(200).send({
      success:true,
      error:false,
      message: "Email Linked successfully!",
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

exports.getProtocolTypes = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);

    const data = await dbConn.query("CALL sp_getProtocolType()");

    return res.status(200).send({
      data: data[0][0], 
      message: "Protocol types retrieved successfully",
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

