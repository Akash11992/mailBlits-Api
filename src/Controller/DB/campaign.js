const dbConn = require("../../../config/db.config").promise();
const { verifyJwt } = require("../../Controller/jwtAuth");
const async = require('async');
const path =require('path');
const archiver = require('archiver');
const axios = require('axios');
const fs = require('fs');



exports.setCampaignStatus= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    await dbConn.execute(
      "CALL sp_UpdateCampaignStatus(?,?,?)",
      [req.body.isActive,req.body.campaignId,userDetails.companyId]);
let msg;
      if(req.body.isActive){
msg="Campaign Approved succesfully!"
      }else{
msg="Campaign Rejected succesfully!"

      }

    return res.status(200).send({
      message: msg,
    });


  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
}



exports.deleteCampaign = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);

    await dbConn.execute(
      "CALL sp_Delete_campaign(?,?)",
      [userDetails.companyId, req.body.campaignId])


    return res.status(200).send({
      message: 'Campaign Deleted successfully !',
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};



exports.cloneCampaign= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.campaignId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

    const [campaignId] = await dbConn.execute(
      "CALL sp_Clone_campaign(?,?)",
      [userDetails.companyId, req.body.campaignId])



      if(campaignId[0][0].new_campaign_id == -1){
        return res.status(200).send({
          message: "Campaign cloned failed !",
        });
      }

      const newCampaignId = campaignId[0][0].new_campaign_id;

      await dbConn.execute(
        "CALL sp_Clone_attachments(?,?)",
        [req.body.campaignId,newCampaignId])
        

      const [dayCampaignList] =  await dbConn.execute(
          "SELECT * from tbl_days_campaign_mapping where campaign_id=? and company_id=? and action!='d'",
          [req.body.campaignId,userDetails.companyId]);

          for(let day of dayCampaignList){

            await dbConn.execute(
              "INSERT INTO tbl_days_campaign_mapping (company_id,campaign_id,day_id,is_active,created_by,action) VALUES (?,?,?,?,?,?)",
              [day.company_id,newCampaignId,day.day_id,0,userDetails.user_id,'c']);
          }




      const [scheduleForCampaignMappingList] =  await dbConn.execute(
        "SELECT * from tbl_schedule_campaign_mapping where campaign_id=? and company_id=? and action!='d'",
        [req.body.campaignId,userDetails.companyId]);
  
        for(let row of scheduleForCampaignMappingList){
  
          await dbConn.execute(
            `INSERT INTO tbl_schedule_campaign_mapping 
            (company_id, campaign_id, schedule_date, schedule_time, schedule_timezone_id, schedule_daily_limit, is_active, created_by,action) 
              VALUES (?,?,?,?,?,?,?,?,'c')`,
            [row.company_id,newCampaignId,row.schedule_date,row.schedule_time,row.schedule_timezone_id,row.schedule_daily_limit,0,userDetails.user_id]);
        
        }



    const [schedulerCampaignRuleList] =  await dbConn.execute(
      "SELECT * from tbl_email_scheduler_rule_for_campaign where campaign_id=? and company_id=?",
      [req.body.campaignId,userDetails.companyId]);

      for(let row of schedulerCampaignRuleList){

        await dbConn.execute(
          `INSERT INTO tbl_email_scheduler_rule_for_campaign 
          (company_id,campaign_id,contact_id,is_send_immediately,scheduler_date,scheduler_time,scheduler_timezone_id,scheduler_daily_limit,
            email_days_id,email_date,email_status_id,user_status_id,subject,content,mailbox_id,cc,bcc,is_active,created_by,action) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [row.company_id,newCampaignId,row.contact_id,row.is_send_immediately,row.scheduler_date,row.scheduler_time,row.scheduler_timezone_id,row.scheduler_daily_limit,row.email_days_id,row.email_date,
            9,3,row.subject,row.content,row.mailbox_id,row.cc,row.bcc,0,userDetails.user_id,'c']);
      
      }


      const [newRuleIdOutput] =  await dbConn.execute(
        "SELECT scheduler_rule_id from tbl_email_scheduler_rule_for_campaign where campaign_id=? and action!='d'",
        [newCampaignId]);
    

        const newRuleId = newRuleIdOutput[0].scheduler_rule_id

        console.log(newRuleId)

    const [schedulerTemplateList] =  await dbConn.execute(
      "SELECT * from tbl_email_scedhuler_template_mapping where campaign_id=? and company_id=? and action!='d'",
      [req.body.campaignId,userDetails.companyId]);

      for(let row of schedulerTemplateList){

        await dbConn.execute(
          `INSERT INTO tbl_email_scedhuler_template_mapping 
          (scheduler_rule_id, company_id, campaign_id, template_name, template_description, is_active, created_by,action) 
            VALUES (?,?,?,?,?,?,?,?)`,
          [newRuleId,row.company_id,newCampaignId,row.template_name,row.template_description,0,userDetails.user_id,'c']);
      
      }

    const [schedulerDocumentList] =  await dbConn.execute(
      "SELECT * from tbl_email_scedhuler_document_mapping where campaign_id=? and action!='d'",
      [req.body.campaignId]);

      for(let row of schedulerDocumentList){

        await dbConn.execute(
          `INSERT INTO tbl_email_scedhuler_document_mapping 
          (scheduler_rule_id, company_id, campaign_id, document_name, document_description, is_password_protected, password_value, is_active, created_by, doc_format_id, doc_path_url,attachment_name,attachment_path,attachment_type,action) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [newRuleId,row.company_id,newCampaignId,row.document_name,row.document_description,row.is_password_protected,row.password_value,0,userDetails.user_id,row.doc_format_id,row.doc_path_url,row.attachment_name,row.attachment_path,row.attachment_type,'c']);
      
      }
  

    return res.status(200).send({
      message: "Campaign cloned !",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: "Campaign Cannot Be cloned"
    });
  }
}




exports.getCampaignById = async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.campaignId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

      const [campaignList] =  await dbConn.execute(
        "SELECT * from tbl_campaign c INNER JOIN tbl_schedule_campaign_mapping scm ON c.campaign_id=scm.campaign_id where c.campaign_id=? and c.company_id=? and c.action!='d'",
        [req.body.campaignId,userDetails.companyId]);
  
      const [attachmentList] =  await dbConn.execute(
        "SELECT * from tbl_attachment_campaign_mapping where campaign_id=? and company_id=? and action!='d'",
        [req.body.campaignId,userDetails.companyId]); 

      for(let atchmnt of attachmentList){
        atchmnt.attachment_path = `${process.env.PROTOCOL}://${req.get('host')}/`+atchmnt.attachment_path;
        atchmnt.attachment_path = atchmnt.attachment_path.replace(/\\/g, "/")
      }

      const [days] =  await dbConn.execute(
        "SELECT day_id from tbl_days_campaign_mapping where campaign_id=? and company_id=? and action!='d'",
        [req.body.campaignId,userDetails.companyId]); 


    return res.status(200).send({
      message: "Campaign Fetched !",
      campaign:campaignList[0],
      attachmentList:attachmentList,
      days:days
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err
    });
  }
}




exports.editCampaign= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.campaignId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

    const [campaignId] = await dbConn.execute(
      "SELECT * FROM tbl_campaign where action!='d'",
      [userDetails.companyId, req.body.campaignId])


    return res.status(200).send({
      message: "Campaign cloned !",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: "Campaign Cannot Be cloned"
    });
  }
}




// Function to get file paths from the database
async function getFilePaths(req,companyId) {


  
  const campaignId = req.body.campaignId;

  const [rows] = await dbConn.execute("SELECT doc_path_url FROM tbl_email_scedhuler_document_mapping WHERE campaign_id=? and company_id = ? and is_document=1 and action!='d'", [campaignId,companyId]);


  const returnObj =rows.map(row => (`${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${row.doc_path_url}`).replace(/\\/g, "/"))
  
  return returnObj;
}




exports.downloadZip = async (req, res) => {

  const userDetails = verifyJwt(req);

  try {
    
    const filePaths = await getFilePaths(req,userDetails.companyId);

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const downloadPromises = [];
    async.eachLimit(filePaths, 1000, (filePath, callback) => {
      const fileName = path.basename(filePath);
      const downloadPath = path.join(tempDir, fileName);
      downloadFile(filePath, downloadPath)
        .then(() => callback())
        .catch(callback);
    }, (err) => {
      if (err) {
        console.error('Error downloading files:', err);
        res.status(500).send('Error downloading files');
        return;
      }

      const zipPath = path.join(__dirname, 'documents.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        res.download(zipPath, 'documents.zip', (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error downloading the file');
          }

          fs.unlinkSync(zipPath);
          fs.rmdirSync(tempDir, { recursive: true });
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);

      filePaths.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const downloadPath = path.join(tempDir, fileName);
        archive.file(downloadPath, { name: fileName });
      });

      archive.finalize();
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating the ZIP file');
  }
};



// Function to download a file
async function downloadFile(url, downloadPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}