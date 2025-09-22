const dbConn = require("../../../config/db.config").promise();
const { verifyJwt } = require("../../Controller/jwtAuth");
require('web-streams-polyfill');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


async function convertHtmlToPdf(htmlString, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlString);

  await page.pdf({ path: outputPath, format: 'A4' });

  await browser.close();
}



// async function convertHtmlToDoc(htmlString, outputPath) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setContent(htmlString);

//   await page.({ path: outputPath, format: 'A4' });

//   await browser.close();
// }


exports.getMailPreview= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.schedulerRuleId){
      return res.status(400).send({
        message: 'provide required fields !'
      });
    }

    // const [templateList] = await dbConn.execute(
    //   "SELECT template_name,template_description from tbl_email_scedhuler_template_mapping where scheduler_rule_id=? and company_id=?",
    //   [req.body.schedulerRuleId, userDetails.companyId]
    // );


    // const [documentList] = await dbConn.execute(
    //   "SELECT document_name,document_description,is_password_protected,password_value,doc_format_typ,doc_path_url from tbl_email_scedhuler_document_mapping tesdm INNER JOIN tbl_doc_format df ON tesdm.doc_format_id=df.doc_format_id where tesdm.scheduler_rule_id=? and tesdm.company_id=?",
    //   [req.body.schedulerRuleId, userDetails.companyId]
    // );


        console.log("cid...", userDetails.companyId);
        const [templateList] = await dbConn.query(
          "CALL sp_GetEmailSchedulerTemplates(?,?)",
          [req.body.schedulerRuleId,userDetails.companyId],
        );


        const [templateDocumentList] = await dbConn.query(
          "CALL sp_GetDocumentList(?,?)",
          [req.body.schedulerRuleId,userDetails.companyId],
        );


        if(templateDocumentList.length>0){
          console.log('insode')
          templateDocumentList[0].forEach(doc=>doc.doc_path_url = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${doc.doc_path_url}`)
        }
    

        return res.status(200).send({
          message: "Preview fetched successfully!",
          templateList:templateList[0],
          templateDocumentList:templateDocumentList[0]
        });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}




exports.reSchedule= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.schedulerRuleIdList || !req.body.time || !req.body.date|| req.body.schedulerRuleIdList.length==0 || !req.body.schedulerTimezoneId){
      return res.status(400).send({
        message: 'provide required fields !'
      });
    }

    const listIds = req.body.schedulerRuleIdList.join(',');

    await dbConn.execute(
      `UPDATE  tbl_email_scheduler_rule_for_campaign SET action='u',email_date=?,scheduler_time=?,scheduler_timezone_id=?,is_active=1 WHERE company_id=? and scheduler_rule_id IN (?) and email_status_id=1`,
      [req.body.date,req.body.time,req.body.schedulerTimezoneId,userDetails.companyId,listIds]
    );

        return res.status(200).send({
          message: "Schedule updated !"
        });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}




exports.stopMail= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.schedulerRuleIdList){
      return res.status(400).send({
        message: 'provide required fields !'
      });
    }

    const listIds = req.body.schedulerRuleIdList.join(',');

    await dbConn.execute(
      `UPDATE  tbl_email_scheduler_rule_for_campaign SET email_status_id=9,action='u' WHERE company_id=? and scheduler_rule_id IN (?) and email_status_id=1`,
      [userDetails.companyId,listIds]
    );

        return res.status(200).send({
          message: "Email status updated !"
        });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}





exports.deleteMail= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(!req.body.schedulerRuleIdList){
      return res.status(400).send({
        message: 'provide required fields !'
      });
    }

    const listIds = req.body.schedulerRuleIdList;

    await dbConn.query(
      // `DELETE FROM tbl_email_scedhuler_document_mapping WHERE company_id=? and scheduler_rule_id IN (?)`,
      `UPDATE tbl_email_scedhuler_document_mapping SET action='d',is_active=0,created_at = NOW() WHERE company_id=? and scheduler_rule_id IN (?)`,

      [userDetails.companyId,listIds]
    );


    await dbConn.query(
      // `DELETE FROM tbl_email_scedhuler_template_mapping WHERE company_id=? and scheduler_rule_id IN (?)`,
  `update tbl_email_scedhuler_template_mapping  SET action='d',is_active=0,created_at = NOW() WHERE company_id=? and scheduler_rule_id IN (?)`,
      [userDetails.companyId,listIds]
    );


    await dbConn.query(
      // `DELETE FROM tbl_email_scheduler_rule_for_campaign WHERE company_id=? and scheduler_rule_id IN (?) and email_status_id=1`,
     `update tbl_email_scheduler_rule_for_campaign SET action='d',is_active=0,created_at = NOW() WHERE company_id=? and scheduler_rule_id IN (?)`,
      [userDetails.companyId,listIds]
    );

        return res.status(200).send({
          message: "Email Deleted !"
        });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}






exports.convertToDoc= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);


    // const [templateList] = await dbConn.execute(
    //   "SELECT template_name,template_description from tbl_email_scedhuler_template_mapping where scheduler_rule_id=? and company_id=?",
    //   [req.body.schedulerRuleId, userDetails.companyId]
    // );


    const [documentList] = await dbConn.execute(
      "SELECT document_name,document_description,is_password_protected,password_value,doc_format_type from tbl_email_scedhuler_document_mapping tesdm INNER JOIN tbl_doc_format df ON tesdm.doc_format_id=df.doc_format_id where tesdm.scheduler_rule_id=? and tesdm.company_id=? and tesdm.is_active=1",
      [req.body.schedulerRuleId, userDetails.companyId]
    );

    console.log(documentList[0].document_description)

    let dirPath = `src/uploads/12/campaign`;
    let get = 'omega.pdf';

    const outputPath = path.join(dirPath, get);

    // Check if the output directory exists, create it if necessary, and then convert HTML to PDF
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }


    await convertHtmlToPdf(documentList[0].document_description, outputPath)
    .then(() => {
      console.log('PDF created successfully.');
    })
    .catch((error) => {
      console.error('Error creating PDF:', error);
    });

    return res.status(200).send({
      message: "Email fetched successfully!",
      documentList:documentList
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}






exports.updateSchedulerTableStatus= async (req, res, next) => {

  console.log('inside')
  try {

    if(!req.body.logList){
      return res.status(400).send({
        message: "Provide required fields"
      });
    }

    if(req.body.logList.length == 0){
      return res.status(400).send({
        message: "Log list missing"
      });
    }


    for(let obj of req.body.logList){
      let message = "";
      
      if(!obj.scheduler_rule_id){
        message += 'scheduler_rule_id'
      }

      if(message!=""){
        return res.status(400).json({
          message: message+" field might be missing in one of the object !"
        });
      }
    }



    for(let obj of req.body.logList){
      let sql = "UPDATE tbl_email_scheduler_rule_for_campaign SET ";
      let values = [];
  
  
      if (obj.remarks !== null) {
        sql += "remarks=?,";
        values.push(obj.remarks);
      }
    
      if (obj.email_status_id !== null) {
        sql += "email_status_id=?,";
        values.push(obj.email_status_id);
      }
    
      if (obj.mail_send_time !== null) {
        sql += "mail_send_time=?,";
        values.push(obj.mail_send_time);
      }
    
      if (obj.message_id !== null) {
        sql += "message_id=?,";
        values.push(obj.message_id);
      }
    
      if (obj.customize_message_id !== null) {
        sql += "customize_message_id=?,";
        values.push(obj.customize_message_id);
      }
      if (obj.user_status_id !== null) {
        sql += "user_status_id=?,";
        values.push(obj.user_status_id);
      }
    
      sql = sql.slice(0, -1);
    
   
      sql += " WHERE scheduler_rule_id=?";
      values.push(obj.scheduler_rule_id);
  
      await dbConn.execute(sql,values);
    } 

    // const dataArray = req.body.logList;
    // let sql = 'UPDATE tbl_email_scheduler_rule_for_campaign SET ';
    // let values = [];
    // dataArray.forEach(item => {
    //   sql += `remarks = CASE scheduler_rule_id WHEN ${item.scheduler_rule_id} THEN ? ELSE remarks END,
    //           email_status_id = CASE scheduler_rule_id WHEN ${item.scheduler_rule_id} THEN ? ELSE email_status_id END,
    //           mail_send_time = CASE scheduler_rule_id WHEN ${item.scheduler_rule_id} THEN ? ELSE mail_send_time END,
    //           message_id = CASE scheduler_rule_id WHEN ${item.scheduler_rule_id} THEN ? ELSE message_id END,
    //           customize_message_id = CASE scheduler_rule_id WHEN ${item.scheduler_rule_id} THEN ? ELSE customize_message_id END,`;
    //   values.push(item.remarks, item.email_status_id, item.mail_send_time, item.message_id, item.customize_message_id);
    // });

    //   sql = sql.slice(0, -1);
    //   sql += ' WHERE scheduler_rule_id IN (?)';


    //   console.log(sql);


    //   await dbConn.execute(sql, [values, dataArray.map(item => item.scheduler_rule_id)])
    
     // Insert into tbl_email_analysis for each object in logList
     for (let obj of req.body.logList) {
      await dbConn.query(
        "call sp_create_email_analysis(?,?,?,?,?,?)",
        [obj.scheduler_rule_id, obj.email_status_id, obj.user_status_id, obj.mail_send_time,obj.company_id,obj.recipients_email]
      );
    }
      return res.status(200).json({
        message: "Email Status updated!",
        success:true,
        error:false
      });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}
