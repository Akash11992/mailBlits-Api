const { log } = require("handlebars");
const campaignModel = require("../Models/campaign.model");
const templatetModel = require("../Models/template.model");
const { buildEmailSubjectPrompt } = require("../prompts/emailSubjectPromtBuilder");
const { generateContent } = require("../service/open_ai_service");
const { verifyJwt } = require("../Controller/jwtAuth");
const db = require("../../config/db.config");
const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require("path");

const htmlToDocx = require("html-docx-js");
const { exec } = require('child_process');

require('dotenv').config();
const crypto = require('crypto');

var AES = require("crypto-js/aes");

const mammoth = require('mammoth');
const PizZip = require('pizzip');

const JSZip = require('jszip');
const xml2js = require('xml2js');

const WordExtractor = require("word-extractor"); 
const { Document,Media } = require('docx');
 
async function convertHtmlToPdf(document, outputPath, requiredPassword) {

  const paddedHtmlString = `<div style="padding: 20px;">${document.document_description}</div>`;

  console.log("====header footer info==========")
  // console.log(document.headerName)
  // console.log(document.headerDescription)
  // console.log(document.footerName)
  // console.log(document.footerDescription)


  let headerInfo ="";
  let footerInfo = "";

  if(document.headerDescription){
    let removeFontClass = document.headerDescription.replace(/<\/?font[^>]*>/g, '');
    let footerFinal = `<div style="font-size: 9px;margin:auto">${removeFontClass}</div>`
    headerInfo = footerFinal;
  }

  if(document.footerDescription){
    let removeFontClass = document.footerDescription.replace(/<\/?font[^>]*>/g, '');
    let footerFinal = `<div style="font-size: 9px;margin:auto">${removeFontClass}</div>`
    footerInfo = footerFinal;
  }

  const browser = await puppeteer.launch({
    executablePath:process.env.EXECUTABLE_Path,
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

  // await page.pdf({ path: outputPath, format: "A4" });

  await browser.close();


  if(requiredPassword){
    // qpdf command to encrypt the PDF
    const command = `qpdf --encrypt ${requiredPassword} ${requiredPassword} 256 -- "${outputPath}" --replace-input`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error encrypting PDF: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`qpdf stderr: ${stderr}`);
            return;
        }
        console.log(`PDF encrypted successfully. Encrypted PDF saved to: ${outputPath}`);
    });
  }


console.log("outputPath",outputPath)

  return outputPath;
}




async function convertHtmlToDocx(htmlString, outputPathDocx, requiredPassword,document) {


  console.log("====header footer info==========")
  console.log(document.headerName)
  console.log(document.headerDescription)
  console.log(document.footerName)
  console.log(document.footerDescription)

  if(document.letterHeadPath || document.headerDescription || document.footerDescription){
    console.log("letterhead path exists")

    await mergeerDoc(htmlString,outputPathDocx,document.letterHeadPath,document.headerDescription,document.footerDescription)

  }else{
    console.log("no letterhead path exists")

    const docxBlob = htmlToDocx.asBlob(htmlString);

    const arrayBuffer = await docxBlob.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);
  
    await require("fs").promises.writeFile(outputPathDocx, docxBuffer);

    if(requiredPassword){
      console.log("requirepassword",requiredPassword)
      // encryptDocx(outputPathDocx,outputPathDocx,requiredPassword)
      // await dummmy(outputPathDocx,requiredPassword,docxBuffer)
    }
  
  }

  
  return outputPathDocx;
}





async function mergeerDoc(htmlString,outputPathDocx, letterHeadPath,header,footer) {

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



  async function extractHeadersFooters(outputPathDocx) {
    console.log("inside ms==============")
    const data = fs.readFileSync(outputPathDocx);
    const zip = await JSZip.loadAsync(data);
    const xmlStr = await zip.file('word/document.xml').async('string');

    const parser = new xml2js.Parser({ explicitChildren: true, preserveChildrenOrder: true, xmlns: true });
    const doc = await parser.parseStringPromise(xmlStr);

    const appendTextToNodes = (node) => {
        if (node.$$) {
            node.$$.forEach(child => {
                if (child['#name'] === 'w:t') {
                    child._ += ' - Modified'; // Append note
                } else {
                    appendTextToNodes(child);
                }
            });
        }
    };
    appendTextToNodes(doc['w:document']['w:body'][0]);

    const builder = new xml2js.Builder();

    const newXmlStr = builder.buildObject(doc);
    zip.file('word/document.xml', newXmlStr);

    const content = await zip.generateAsync({type: 'nodebuffer'});
    await fs.writeFileSync('modified_document.docx', content);
    console.log('Document successfully modified.');
}




function encryptDocx(inputPath, outputPath, password) {
  const content = fs.readFileSync(inputPath, 'binary');
  const encryptedContent = AES.encrypt(
      content,
      password
  ).toString();
  fs.writeFileSync(outputPath, encryptedContent, 'binary');
}







const campaignController = {

  generateSubject: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        throw new Error("Unauthorized");
      }

      const { subject, template_id, query } = req.body;
      let templateDescription = "";

      if(template_id) {
        const template = await templatetModel.getTemplateById(userDetails, template_id);

        if (template.length === 0) {
          throw new Error("Template not found");
        }

        templateDescription = template?.[0]?.[0]?.template_description;

        if(!templateDescription) {
          throw new Error("Template description is required");
        }
      }

      const prompt = buildEmailSubjectPrompt(query, subject, templateDescription);

      const response = await generateContent(prompt);

      const suggestedSubject = response?.choices[0]?.message?.content;

      if(!suggestedSubject) {
        throw new Error("No subject generated");
      }

      const cleanedSubject = suggestedSubject.trim();
      const subjectArray = cleanedSubject
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*"|"$/g, '').trim())
        .filter(line => line);

      res.json({
        success: true,
        error: false,
        message: "Subject generated successfully",
        data: subjectArray,
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: true,
        message: error.message || "Error generating subject",
      });
    }
  },

  createCampaign: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const body = req.body;
      if (!body.campaign_name) {
        return res.status(500).json({
          success: false,
          error: true,
          message: "campaign name is required.",
        });
      } else if (!body.template_id) {
        return res.status(500).json({
          success: false,
          error: true,
          message: "template missing.",
        });
      } else if (!body.list_id && !body.segment_id) {
        return res.status(500).json({
          success: false,
          error: true,
          message: "Either list or segment is missing",
        });
      }

      // Validating cc and bcc emails
      if (body.cc && !isValidEmails(body.cc)) {
        return res.status(500).json({
            success: false,
            error: true,
            message: "Invalid email(s) in cc field.",
        });
    }
    if (body.bcc && !isValidEmails(body.bcc)) {
        return res.status(500).json({
            success: false,
            error: true,
            message: "Invalid email(s) in bcc field.",
        });
    }
      const files = req.files; // Retrieve files array

      // let day_ids_array = body.email_days_id.split(",").map(Number);

      let day_ids_array = body.email_days_id ? body.email_days_id.split(",").map(Number) : [1,2,3,4,5,6,7];

      console.log("==day_ids_array=")

      console.log(day_ids_array)



      const resposne = await campaignModel.validateCampaignExistance(
        userDetails,
        body
      );
  
      if (resposne[0][0].response === "fail") {
        res.status(500).json({
          success: false,
          error: true,
          message: "Campaign already exist!",
        });
      } else {
        const campaignIds = resposne
          .filter(
            (entry) =>
              entry.length === 1 && entry[0].hasOwnProperty("campaign_id")
          )
          .map((entry) => entry[0].campaign_id);

        let campaign_id = campaignIds[0];
        const contactResult = await campaignModel.getAllContact(
          userDetails,
          body.list_id
        );
        // console.log("contactResult",contactResult[0]);
        const TemplateResult = await campaignModel.getUserTemplate(
          userDetails,
          campaign_id
        );
        const DocumentResult = await campaignModel.getUserDocument(
          userDetails,
          campaign_id
        );

        const modifiedSubjectResult = await contactResult[0].map((contact) => {
          return {
            subject: replacePlaceholders(
              body.subject,
              contact
            ),
          };
        });
        console.log(`modifiedSubjectResult`, modifiedSubjectResult);
        const modifiedTemplateResult = await contactResult[0].map((contact) => {
          return {
            campaign_id: TemplateResult[0][0].campaign_id,
            template_name: TemplateResult[0][0].template_name,
            template_description: replacePlaceholders(
              TemplateResult[0][0].template_description,
              contact
            ),
          };
        });

        if (req.body.send_immediately === "1") {

          const templateInsertionSchedulerResult =
            await templateInsertionScheduler(
              campaign_id,
              modifiedTemplateResult,
              resposne,
              userDetails,
              null,
              modifiedSubjectResult
            );
        }
        const modifiedDocumentResult = [];

        DocumentResult[0].forEach((document) => {
          contactResult[0].forEach((contact) => {
            modifiedDocumentResult.push({
              campaign_id: document.campaign_id,
              doc_format_id: document.doc_format_id,
              document_name: document.document_name,
              letterHeadName:document.letterHeadName,
              letterHeadFileName:document.letterHeadFileName,
              letterHEadType:document.letterHEadType,
              letterHeadPath:document.letterHeadPath,
              headerName:document.headerName,
              headerDescription:document.headerDescription,
              footerName:document.footerName,
              footerDescription:document.footerDescription,
              attachment_path:document.attachment_path,
              attachment_name:document.attachment_name,
              attachment_type:document.attachment_type,
              document_name:replacePlaceholders(
                document.document_name,
                contact
              ),
              document_description: replacePlaceholders(
                document.document_description,
                contact
              ),
              contact_id: contact.contact_id, // Include the contact_id here,
              is_password_protected: document.is_password_protected, // Include
              password_value: replacePasswordPlaceholders(
                document.password_key,
                contact
              ),
            });
          });
        });

        // Insert modified document into the database
        if (req.body.send_immediately === "1") {
          const documentsToInsert = modifiedDocumentResult.filter(
            (doc) => doc.document_name !== null
          );
          if (documentsToInsert.length > 0) {
            const documentInsertionSchedulerResult =
              await documentInsertionScheduler(
                modifiedDocumentResult,
                resposne,
                userDetails,
                null
              );
            // console.log(
            //   "documentInsertionSchedulerResult",
            //   documentInsertionSchedulerResult
            // );
          } else {
            console.log(
              "No documents to insert because document_name is null."
            );
          }
        }
        const contactIds = contactResult[0].map(
          (contact) => contact.contact_id
        );
        // console.log(contactIds);
        let scheduledEmailsRule_result;
        if (body.send_immediately === "0") {
          let email_status_id = 1;
          scheduledEmailsRule_result = await scheduleEmails(
            contactIds,
            day_ids_array,
            body.schedule_date,
            body.schedule_daily_limit || 50,
            campaign_id,
            body.schedule_timezone_id || 181, 
            body.schedule_time || '00:00:00',
            userDetails.companyId,
            body.send_immediately,
            email_status_id
          );
          // console.log(scheduledEmailsRule_result);
        }
        const result = await campaignModel.createCampaign(
          userDetails,
          body,
          files || [],
          scheduledEmailsRule_result || []
        );
        // Extracting scheduler IDs
        const schedulerIds = result.map(
          (scheduleResult) => scheduleResult[0][0].schedule_id
        );

        // console.log("scheduler IDs:", schedulerIds);

        if (req.body.send_immediately === "0") {
          const templateInsertionSchedulerResult =
            await templateInsertionScheduler(
              campaign_id,
              modifiedTemplateResult,
              null,
              userDetails,
              schedulerIds,
              modifiedSubjectResult
            );
          // console.log(
          //   "templateInsertionSchedulerResult",
          //   templateInsertionSchedulerResult
          // );
        }

        if (req.body.send_immediately === "0") {
          const documentsToInsert = modifiedDocumentResult.filter(
            (doc) => doc.document_name !== null
          );
          if (documentsToInsert.length > 0) {
            const documentInsertionSchedulerResult =
              await documentInsertionScheduler(
                modifiedDocumentResult,
                null,
                userDetails,
                schedulerIds
              );
            // console.log(
            //   "documentInsertionSchedulerResult",
            //   documentInsertionSchedulerResult
            // );
          } else {
            console.log(
              "No documents to insert because document_name is null."
            );
          }
        }
        res.json({
          success: true,
          error: false,
          message: "Campaign created successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getAllCampaign: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await campaignModel.getAllCampaign(userDetails);

      if(result[0].length == 0){
        return res.json({
          success: true,
          error: false,
          message: "No campaigns active !",
          data: [],
          count: 0,
        });
      }

      if (result[0][0].response === "fail") {
        res.json({
          success: false,
          error: true,
          message: "campaign does not exist!",
          data: [],
          count: 0,
        });
      } else {
        res.json({
          success: true,
          error: false,
          message: "Campaigns fetched successfully!",
          data: result[0],
          count: result[1][0].count,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getAllCountriesTimezone: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await campaignModel.getAllCountriesTimezone(userDetails);

      res.json({
        success: true,
        error: false,
        message: "countries with timezone fetched successfully!",
        data: result[0],
        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getAllDays: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await campaignModel.getAllDays(userDetails);

      res.json({
        success: true,
        error: false,
        message: "days fetched successfully!",
        data: result[0],
        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getActiveCampaigns: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await campaignModel.getActiveCampaigns(userDetails);

      res.json({
        success: true,
        error: false,
        message: "Active Campaigns fetched successfully!",
        data: result[0],
        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
};

const scheduleEmails = (
  contactIds,
  emailDays,
  startDate,
  dailyLimit,
  campaign_id,
  schedule_timezone_id,
  schedule_time,
  company_id,
  is_send_immediately,
  email_status_id
) => {
  const emails = [];

  // Create a copy of contactIds
  let remainingContacts = [...contactIds];

  // Start date object
  let currentDate = new Date(startDate);

  // Function to get the next available contact for a specific day
  const getNextContactForDay = (dayIndex) => {
    const contactsForDay = remainingContacts.filter((contactId) => {
      const contactDate = new Date(currentDate);
      contactDate.setDate(
        contactDate.getDate() + ((dayIndex - contactDate.getDay() + 7) % 7)
      );
      return (
        contactDate.toISOString().split("T")[0] ===
        currentDate.toISOString().split("T")[0]
      );
    });

    // Take contacts up to the daily limit
    const selectedContacts = contactsForDay.slice(0, dailyLimit);

    // Remove selected contacts from remainingContacts
    remainingContacts = remainingContacts.filter(
      (contactId) => !selectedContacts.includes(contactId)
    );

    return selectedContacts;
  };

  // Loop until all contacts have been scheduled
  while (remainingContacts.length > 0) {
    // Iterate over each day
    for (const dayIndex of emailDays) {
      // Get contacts for the current day
      const contactsForDay = getNextContactForDay(dayIndex);

      // Add contacts to emails array with campaign_id and email_day_id
      contactsForDay.forEach((contactId) => {
        emails.push({
          contactId: contactId,
          sendEmailDate: currentDate.toISOString().split("T")[0],
          campaign_id: campaign_id,
          email_day_id: dayIndex,
          schedule_timezone_id: schedule_timezone_id,
          schedule_time: schedule_time,
          company_id: company_id,
          is_send_immediately: is_send_immediately,
          email_status_id: email_status_id,
          schedule_daily_limit: dailyLimit,
        });
      });

      // Check if all contacts have been scheduled
      if (remainingContacts.length === 0) {
        break;
      }
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return emails;
};

// Function to replace placeholders with actual values dynamically
function replacePlaceholders(template, contact) {
  let replacedTemplate = template;
  const contactDetail = {};

  // Convert keys in contact_detail to lowercase
  for (const key in contact.contact_detail) {
    contactDetail[key.toLowerCase()] = contact.contact_detail[key];
  }

  for (const key in contactDetail) {
    if (contactDetail.hasOwnProperty(key)) {
      const placeholder = new RegExp(`{{${key}}}`, "gi"); // Use case-insensitive regex
      replacedTemplate = replacedTemplate?.replace(
        placeholder,
        contactDetail[key]
      );
    }
  }
  return replacedTemplate;
}

// Function to replace placeholders with actual values dynamically for password
function replacePasswordPlaceholders(passwordKeys, contact) {
  if (!passwordKeys || !Array.isArray(passwordKeys)) {
    return null; // Return null if passwordKeys is null or not an array
  }

  let passwordValue = "";
  const contactDetail = {};

  // Convert keys in contact_detail to lowercase
  for (const key in contact.contact_detail) {
    contactDetail[key.toLowerCase()] = contact.contact_detail[key];
  }

  passwordKeys.forEach((key) => {
    const smallKey = key.toLowerCase(); // Convert key to lowercase
    if (contactDetail.hasOwnProperty(smallKey)) {
      passwordValue += contactDetail[smallKey];
    }
  });
  return passwordValue;
}

async function templateInsertionScheduler(
  campaign_id,
  modifiedTemplateResult,
  response,
  userDetails,
  schedulerIdsRule,
  modifiedSubjectResult
) {
  try {
    // console.log("response!=null", response != null);
    let scheduleIds;
    if (response != null) {
      // Extracting schedule_ids from the response array
      scheduleIds = response
        .filter((entry) => entry[0] && entry[0].schedule_id)
        .map((entry) => entry[0].schedule_id);
    } else {
      scheduleIds = schedulerIdsRule;
    }
    // Iterate through each template result and its corresponding schedule_id and insert data into the stored procedure
    for (let i = 0; i < modifiedTemplateResult.length; i++) {
      const template = modifiedTemplateResult[i];
      const scheduleId = scheduleIds[i];
const campaign_subject=modifiedSubjectResult[i].subject;
// console.log(`campaign_subject`, campaign_subject);
      try {
        // Call the stored procedure using a prepared statement
        await new Promise((resolve, reject) => {
          db.query(
            "CALL sp_create_scheduler_template(?, ?, ?, ?, ?,?,?)",
            [
              scheduleId,
              userDetails.companyId,
              template.template_name,
              template.template_description,
              userDetails.user_id,
              campaign_id,
              campaign_subject
            ],
            (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        });
        console.log(
          `Data inserted for template ${template.template_name} with schedule_id: ${scheduleId}`
        );
      } catch (error) {
        console.error(
          `Error inserting data for template ${template.template_name} with schedule_id ${scheduleId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function documentInsertionScheduler(
  modifiedDocumentResult,
  response,
  userDetails,
  schedulerIdsRule
) {
  try {
    // Group modified documents by contact_id

    const documentsByContact = {};
    modifiedDocumentResult.forEach((document) => {
      if (!documentsByContact[document.contact_id]) {
        documentsByContact[document.contact_id] = [];
      }
      documentsByContact[document.contact_id].push(document);
    });

    let scheduleIds;
    // Extracting schedule_ids from the response array
    if (response != null) {
      scheduleIds = response
        .filter((entry) => entry[0] && entry[0].schedule_id)
        .map((entry) => entry[0].schedule_id);
    } else {
      scheduleIds = schedulerIdsRule;
    }
    // Iterate through each contact's documents and insert them with the same schedule_id
    for (const contactId in documentsByContact) {
      const documents = documentsByContact[contactId];
      const scheduleId = scheduleIds.shift(); // Get the next schedule_id
      const campaignId = documentsByContact[contactId][0].campaign_id;

      // console.log("documentsByContact", documentsByContact[contactId][0]);

      // Insert documents for the current contact with the same schedule_id
      for (const document of documents) {
        try {
          // console.log(document.is_password_protected, document.password_value);
          // Call the stored procedure using a prepared statement

          let outputPath = "";
          let attachment_name = document.attachment_name;
          let attachment_type = document.attachment_type;
          let attachment_path = document.attachment_path;

          let isDocument = 1;

          if(attachment_name && attachment_path){
            isDocument = 0;
          }


          console.log("===document.doc_format_id=========");
          console.log(document.doc_format_id);

          console.log("===campaignId ID=========");
          console.log(campaignId);

          console.log("====contact id=========");
          console.log(contactId);
          

          if (document.doc_format_id == 1) {
            console.log("inside convert");
            outputPath = await convertToPDFandSave(
              document,
              userDetails.companyId,
              contactId,
              campaignId
            );
           
          } else if (document.doc_format_id == 2) {
            outputPath = await convertToDocAndSave(
              document,
              userDetails.companyId,
              contactId,
              campaignId
            );
          }

          let password = "";

          if (document.password_value) {
            password = document.password_value.toUpperCase();
          }

          await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_create_scheduler_document(?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)",
              [
                scheduleId,
                userDetails.companyId,
                document.document_name,
                document.document_description,
                userDetails.user_id,
                document.is_password_protected,
                password,
                document.doc_format_id,
                outputPath,
                campaignId,
                attachment_name,
                attachment_path,
                attachment_type,
                isDocument
              ],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results);
                }
              }
            );
          });
          console.log(
            `Data inserted for document ${document.document_name} with schedule_id: ${scheduleId}`
          );
        } catch (error) {
          console.error(
            `Error inserting data for document ${document.document_name} with schedule_id ${scheduleId}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

const convertToPDFandSave = async (
  document,
  companyId,
  contactId,
  campaignId
) => {
  try {
    let dirPath = `src/uploads/campaign_documents/${companyId}/${campaignId}/${contactId}`;

    let fileName = `${document.document_name.replace(/\s+/g, '')}.pdf`;

    const outputPath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
 
    let requiredPassword;
    if (document.is_password_protected === 1) {
      requiredPassword = document.password_value;
    } else {
      requiredPassword = null;
    }
    await convertHtmlToPdf(
      document,
      outputPath,
      requiredPassword
    );
    console.log("PDF created successfully.");
    // console.log(outputPath);
    return outputPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const convertToDocAndSave = async (
  document,
  companyId,
  contactId,
  campaignId
) => {
  try {
    let dirPath = `src/uploads/campaign_documents/${companyId}/${campaignId}/${contactId}`;

    let fileName = `${document.document_name.replace(/\s+/g, '')}.docx`;

    const outputPath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    let requiredPassword;
    if (document.is_password_protected === 1) {
      requiredPassword = document.password_value;
    } else {
      requiredPassword = null;
    }
    await convertHtmlToDocx(
      document.document_description,
      outputPath,
      requiredPassword,
      document
    );

    console.log("docx created successfully 3.");
    console.log(outputPath);
    return outputPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

function isValidEmails(emails){
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailArray = emails.split(',').map(email => email.trim());
  for (const email of emailArray) {
    // console.log("email",email);
      if (!emailRegex.test(email)) {
          return false;
      }
  }
  return true;
}
module.exports = campaignController;
