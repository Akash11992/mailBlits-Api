const dbConn = require("../../../config/db.config").promise();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const { verifyJwt } = require("../jwtAuth");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const he = require("he");
const htmlToDocx = require("html-docx-js");
const { log } = require("async");
const handlebars = require("handlebars");
exports.GetTemplates = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);
    console.log(userDetails);

    const [roleRow] = await dbConn.execute(
      "SELECT tmp.template_id AS templateId ,tmp.template_name as templateName,tmp.raw_html AS html, ru.full_name AS name, tmp.created_at AS updatedAt from tbl_template tmp JOIN tbl_users ru ON tmp.created_by=ru.user_id WHERE company_id=?",
      [userDetails.companyId]
    );

    if (roleRow.length == 0) {
      return res.status(400).send({
        message: "No Template Found!",
      });
    }

    return res.status(200).send({
      message: "Template Fetched!",
      data: roleRow,
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

exports.GetTemplateById = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);

    const [roleRow] = await dbConn.execute(
      "SELECT template_id AS templateId ,template_name as templateName,raw_html AS html from tbl_template WHERE company_id=? and template_id=? and is_active=1",
      [userDetails.companyId, req.body.templateId]
    );

    if (roleRow.length == 0) {
      return res.status(400).send({
        message: "No Template Found!",
      });
    }

    return res.status(200).send({
      message: "Template Fetched!",
      data: roleRow,
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

exports.CreateTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: "Required fields missing!" });
    }

    const userDetails = verifyJwt(req);

    const [roleRow] = await dbConn.execute(
      `INSERT INTO tbl_template (template_name, raw_html, company_id,created_by)
     SELECT ?, ?, ?, ?
     FROM dual
     WHERE NOT EXISTS (
       SELECT 1
       FROM tbl_template
       WHERE template_name = ? AND company_id = ?
     )`,
      [
        req.body.templateName,
        he.decode(req.body.html),
        userDetails.companyId,
        userDetails.user_id,
        userDetails.user_id,
        req.body.templateName,
        userDetails.companyId,
      ]
    );

    if (roleRow.affectedRows == 0) {
      return res.status(400).send({
        message: "Emailer with same name already exists!!",
      });
    }

    return res.status(200).send({
      message: "Emailer Added Successfully!",
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message,
    });
  }
};

exports.UpdateTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: "Required fields missing!" });
    }

    const userDetails = verifyJwt(req);

    const [roleRow] = await dbConn.execute(
      `UPDATE tbl_template SET template_name=?,raw_html=?,action='u',created_by=?,created_at=NOW() WHERE template_id=? AND company_id=?`,
      [
        req.body.templateName,
        he.decode(req.body.html),
        userDetails.user_id,
        req.body.templateId,
        userDetails.companyId,
      ]
    );

    if (roleRow.affectedRows == 0) {
      return res.status(400).send({
        message: "No Such Template Exists!!",
      });
    }

    return res.status(200).send({
      message: "Template Updated Successfully!",
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

//.....................new......asma...................................................

exports.getTemplateType = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);
    console.log(userDetails);

    const [data] = await dbConn.query("call sp_getall_template_type(); ");

    if (data.length == 0) {
      return res.status(400).send({
        success: false,
        error: true,
        message: "No Template Type Found!",
      });
    }

    return res.status(200).send({
      success: true,
      error: false,
      message: "Template Type Fetched!",
      data: data[0],
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

exports.addDocument = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: "Required fields missing!" });
    }
    if(!req.body.doc_format_id){
      return res.status(400).json({ message: "Doc format is required!" });
    }else if(!req.body.doc_type){
      return res.status(400).json({ message: "Title is required!!" });
    }else if(!req.body.description){
      return res.status(400).json({ message: "Description is required!!" });
    }

    const userDetails = verifyJwt(req);
    let outputPath = "";
    let docType = "PDF";

    let headerDescription = "";
    let footerDescription = "";

    if(req.body.header_id && req.body.header_id!=""){
      const [row] = await dbConn.execute(
        "SELECT description FROM `tbl_doc_header` WHERE `header_id`=? AND `company_id`=? AND `is_active`=1",
        [req.body.header_id, userDetails.companyId]
      );
      headerDescription = row[0].description;
    }


    if(req.body.footer_id && req.body.footer_id!=""){
      const [row] = await dbConn.execute(
        "SELECT description FROM `tbl_doc_footer` WHERE `footer_id`=? AND `company_id`=? AND `is_active`=1",
        [req.body.footer_id, userDetails.companyId]
      );

      footerDescription = row[0].description;
    }

    if (req.body.doc_format_id == 1) {
      docType = "PDF";
      console.log("inside PDF type 1")
      outputPath = await convertToPDFandSave(
        req.body.doc_type,
        req.body.description,
        userDetails.companyId,
        headerDescription,
        footerDescription
      );
      console.log("object", outputPath);
    } else {
      docType = "DOC/DOCX";
      outputPath = await convertToDocAndSave(
        req.body.doc_type,
        req.body.description,
        userDetails.companyId,
        headerDescription,
        footerDescription
      );
    }
    console.log("abc", outputPath);
    const [result] = await dbConn.query(
      "call sp_create_document(?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        userDetails.companyId,
        req.body.doc_type,
        req.body.description,
        userDetails.user_id,
        req.body.doc_format_id,
        req.body.is_password_protected,
        JSON.stringify(req.body.password_key),
        outputPath,
        req.body.letter_head_id,
        req.body.header_id,
        req.body.footer_id,
        req.body.list_id ? req.body.list_id : null
      ]
    );

    console.log("After document is created !");
    // console.log(result[0][0].response);
    if (result[0] && result[0][0].response === "fail") {
      return res.status(400).send({
        success: false,
        error: true,
        message: "Document already exists!!",
      });
    }

    return res.status(200).send({
      success: true,
      error: false,
      message: "Document Added Successfully!",
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message,
    });
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const userDetails = verifyJwt(req);
    console.log(userDetails);

    const [data] = await dbConn.query("call sp_getall_document(?);", [
      userDetails.companyId,
    ]);

    if (data.length == 0) {
      return res.status(400).send({
        success: false,
        error: true,
        message: "No document Found!",
      });
    }

    return res.status(200).send({
      success: true,
      error: false,
      message: "Document Fetched Successfully!",
      data: data[0],
    });
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message,
    });
  }
};

const convertToPDFandSave = async (document_name, document_html, companyId,header,footer) => {
  try {

    let dirPath = `src/uploads/test_campaign_documents/${companyId}`;

    let fileName =
      Date.now() + "-" + `${document_name.replace(/\s+/g, "")}.pdf`;

    const outputPath = path.join(dirPath, fileName);
    // Check if the output directory exists, create it if necessary, and then convert HTML to PDF
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    console.log("After Test !");

// ........................................new....................................
// let htmlFilePath = path.join(__dirname, '../../middleware/Templates/Ambit Wealth Private Limited.html');
//     console.log("path......1.", htmlFilePath);
//     const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

//     // Create a Handlebars template
//     const template = handlebars.compile(htmlContent);
//     // Render the template with the dynamic content
//     const replacedHtml = template({ template_description: document_html });
//     const outputPathHTML = path.join(dirPath, `${document_name.replace(/\s+/g, "")}.html`);

// // Save the replaced HTML content to a file
// fs.writeFileSync(outputPathHTML, replacedHtml);
// ........................................new.....................................
    console.log("Before await !!");

    await convertHtmlToPdf(document_html, outputPath,header,footer);
    console.log("PDF created successfully.");
    console.log(outputPath);
    return outputPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const convertToDocAndSave = async (document_name, document_html, companyId,header,footer) => {
  try {
    let dirPath = `src/uploads/test_campaign_documents/${companyId}`;

    let fileName =
      Date.now() + "-" + `${document_name.replace(/\s+/g, "")}.docx`;

    const outputPath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    await convertHtmlToDocx(document_html, outputPath,header,footer);

    console.log("docx created successfully.");
    console.log(outputPath);
    return outputPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function convertHtmlToPdf(htmlString, outputPath,header,footer) {
  const paddedHtmlString = `<div style="padding: 20px;">${htmlString}</div>`;
  console.log("PATH", process.env.EXECUTABLE_Path);

  console.log("PDF PATH");

  let headerInfo ="";
  let footerInfo = "";

  if(header){
    let removeFontClass = header.replace(/<\/?font[^>]*>/g, '');
    let footerFinal = `<div style="font-size: 9px;margin:auto">${removeFontClass}</div>`
    headerInfo = footerFinal;
  }

  if(footer){
    let removeFontClass = footer.replace(/<\/?font[^>]*>/g, '');
    let footerFinal = `<div style="font-size: 9px;margin:auto">${removeFontClass}</div>`
    footerInfo = footerFinal;
  }


  const browser = await puppeteer.launch({
    executablePath: process.env.EXECUTABLE_Path,
    args: ["--no-sandbox"],
    headless:true
  });

  
  const page = await browser.newPage();

  await page.setContent(paddedHtmlString);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: headerInfo,
    footerTemplate: footerInfo,
    margin: {
      top: '100px',
      bottom: '50px',
      left: '50px',
      right: '50px'
    }
  });

  await browser.close();

  return outputPath;
}

async function convertHtmlToDocx(htmlString, outputPathDocx,header,footer) {
  // Convert HTML to DOCX using html-docx-js

  console.log("inside coonvert docx")

  console.log("===header",header)
  console.log("===footer",footer)

  if((header && header!="") || (footer && footer!="")){
    console.log("IF FIRS")
    await mergeerDoc(htmlString,outputPathDocx,header,footer)
  }else{
    const paddedHtmlString = `<div style="padding: 20px;">${htmlString}</div>`;

    const docxBlob = htmlToDocx.asBlob(paddedHtmlString);
  
    const arrayBuffer = await docxBlob.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);
  
    await require("fs").promises.writeFile(outputPathDocx, docxBuffer);
  
  }

  return outputPathDocx;
}



async function mergeerDoc(htmlString,outputPathDocx,header,footer) {

  console.log("inside merge-------")

  let headerInfo ="";
  let footerInfo = "";

  if(header){
    headerInfo = header;
  }

  if(footer){
    footerInfo = footer;
  }

  
    const allHtml =`<html
    xmlns:o='urn:schemas-microsoft-com:office:office'
    xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title></title>
    
    <!--[if gte mso 9]><xml>
     <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
    </w:WordDocument>
    </xml><![endif]-->
    
    
    <style>
    p.MsoFooter, li.MsoFooter, div.MsoFooter
    {
        margin:0in;
        margin-bottom:.0001pt;
        mso-pagination:widow-orphan;
        tab-stops:center 3.0in right 6.0in;
        font-size:8.0pt;
    }
    <style>
    
    <!-- /* Style Definitions */
    
    @page Section1
    {
        size:8.5in 11.0in;
        margin:1.0in 1.0in 1.0in 1.0in;
        mso-header-margin:.5in;
        mso-footer-margin:.5in;
        mso-title-page:yes;
        mso-header: h1;
        mso-footer: f1;
        mso-first-header: fh1;
        mso-first-footer: ff1;
        mso-paper-source:0;
    }
    
    
    div.Section1
    {
        page:Section1;
    }
    
    table#hrdftrtbl
    {
        margin:0in 0in 0in 600in;
        width:1px;
        height:1px;
        overflow:hidden;
    }
    -->
    </style></head>
    
    <body lang=EN-US style='tab-interval:.5in'>
    <div class=Section1>
    
    <p> ${htmlString} </p>

    </div>
    
        <table id='hrdftrtbl' border='0' cellspacing='0' cellpadding='0'>
        <tr><td>
    
        <div style='mso-element:header' id=h1 >
            <p class=MsoHeader ><p>&nbsp;${headerInfo}</p></p>
        </div>
    
        </td>
        <td>
        <div style='mso-element:footer' id=f1>
    
            <p>&nbsp;${footerInfo}</p>
            <p class=MsoFooter>
            
            </p>
    
        </div>
  
        </td></tr>
        </table>
    
    
    </body></html>`
  

    const docxBlob = htmlToDocx.asBlob(allHtml);

    const arrayBuffer = await docxBlob.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

  await require("fs").promises.writeFile(outputPathDocx, docxBuffer);

  }