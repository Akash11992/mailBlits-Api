const dbConn = require("../../../config/db.config").promise();
const csv = require('csv-parser');
const fs = require('fs');
const { verifyJwt } = require("../../Controller/jwtAuth");

"use strict";

const Contact = require("../../Models/contact.model");


exports.findAll = function (req, res) {
  Contact.findAll(function (err, contact) {
    if (err) res.send(err);
    res.send(contact);
  });
};

exports.create = function (req, res) {
  const contacts = req.body.contacts;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res
      .status(400)
      .send({ error: true, message: "Please provide all required field" });
  } else {
    Contact.create(contacts, function (err, contact) {
      if (err) res.send(err);
      if (contact?.success) {
        res.json({ error: false, message: "successfully!", data: contact });
      } else {
        res.json({
          error: false,
          message: "contact added successfully!",
          data: contact,
        });
      }
    });
  }
};

exports.findById = function (req, res) {
  Contact.findById(req.params.id, function (err, contact) {
    if (err) res.send(err);
    res.json(contact);
  });
};

exports.updateById = function (req, res) {
//   console.log("params........", req.params.contactID);
  console.log("body........", req?.body);
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: "Please provide updation required fields",
    });
  } else {
    // Contact.updateById(req.params.contactID, new Contact(req.body), function(err, contact) {
    Contact.updateById(
    //   req.params.contactID,
      req?.body || {},
      function (err, contact) {
        if (err) res.send(err);
        res.json({
          contact: contact,
          error: false,
          message: "Contact successfully updated",
        });
      }
    );
  }
};



exports.updateByEmail = function (req, res) {
  console.log("body........", req?.body);
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({
      error: true,
      message: "Please provide updation required fields",
    });
  } else {
    Contact.updateById(
      req?.body || {},
      function (err, contact) {
        if (err) res.send(err);
        res.json({
          contact: contact,
          error: false,
          message: "Contact successfully updated",
        });
      }
    );
  }
};



exports.bulkUpload = async function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let ext = "";
    if (req.file.mimetype === 'text/csv') {
      ext = 'csv'
    } else if (req.file.mimetype === 'application/vnd. ms-excel') {
      ext = 'xlsx'
    }

    let userInfo = JSON.parse(req.body.userInfo);

    await ContactDetailsBulk(req.file.path, ext, userInfo).then(resp => {
      return res.status(200).json({ message: 'File uploaded successfully' + resp });
    }, (error) => {
      console.error("error in controller" + error);
      return res.status(500).json({message: error})
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





exports.ContactDetails = async (req, res, next) => {
  try {

    const [row] = await dbConn.execute(
      // "SELECT * FROM `users` WHERE `Email`=?",
      "SELECT * FROM `company_ragistration` WHERE `company_Id`=?",

      [req.body.company_Id]
    );

    if (row.length === 0) {
      return res.json({
        message: "Invalid company_Id",
      });
    }

    //
    const [rows] = await dbConn.execute(
      // "insert into tbl_contactdetails (`firstName`,`lastName`,`contact_Email`,`user_Details`,`file_UploadId`,`IsActive`,`list_Id`,`company_Id`,`contact_Number`) values(?,?,?,?,?,?,?,?,?)",
      'call sendquickmail_db.Contactdetails(?,?,?,?,?,?,?)',
      [
        req.body.contact_Email,
        req.body.user_Details,
        req.body.file_UploadId,
        req.body.IsActive,
        req.body.list_Id,
        req.body.company_Id,
        req.body.contact_Number,
      ]
    );
    if (rows.affectedRows === 1) {
      return res.status(201).json({
        message: "The contact details has been successfully inserted.",
        success: true,
        data: req.body,
      });
    }

    return res.json({
      success: row,
      message: "companyId matched Successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.ContactDetailsEdit = async (req, res, next) => {
  try {
    const [row] = await dbConn.execute(
      "SELECT * FROM `company_ragistration` WHERE `company_Id`=?",
      [req.body.company_Id]
    );

    if (row.length === 0) {
      // return res.status(422).json({
      return res.json({
        message: "Invalid company_Id",
      });
    }
    const [rows1] = await dbConn.execute(
      // "UPDATE tbl_contactdetails SET `firstName` =?,`company_Id`=?,`lastName`=?,`contact_Email`=?,`user_Details`=?,`file_UploadId`=?,`IsActive`=?,`list_Id`=?,`contact_Number`=? WHERE `contact_id` = ?",
      'call sendquickmail_db.Update_ContactDetails(?,?,?,?,?,?,?,?)',
      [
        req.body.contact_Email,
        req.body.user_Details,
        req.body.file_UploadId,
        req.body.IsActive,
        req.body.list_Id,
        req.body.company_Id,
        req.body.contact_Number,
        req.body.contact_id,
      ]
    );
    if (rows1.affectedRows === 1) {
      return res.status(201).json({
        message: "The contact details has been successfully updated.",
        success: true,
        data: req.body,
      });
    }
    return res.json({
      success: row,
      message: "companyId matched Successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.ContactUnSubscribe = async (req, res, next) => {
  console.log("email.......", req?.body?.email);

  try {
    if (!req?.body?.company_id || !req?.body?.email || !req.body.campaign_id || !req.body.reason) {
      return res.json({
        message: "Provide required fields !",
      });
    }
   
    const [row] = await dbConn.execute(
      "SELECT * FROM `tbl_contact` WHERE `company_id`= ? and email= ? and action!='d'",
      [req?.body?.company_id, req?.body?.email]
    );
    if (row.length === 0) {
      return res.json({
        message: "Invalid contact email",
        success: false,
      });
    }

    for(let cntct of row){
      if(cntct.is_active == 0){
        return res.status(400).json({
          message: "This email is already unsubscribed.",
          success: false,
        });
      }
    }


    await dbConn.execute(
      "UPDATE `tbl_contact` SET action='u',is_active=0 WHERE contact_id=?",
      [row[0].contact_id]
    );

    await dbConn.execute(
      "UPDATE `tbl_contact_list_mapping` SET action='u',is_active=0 WHERE contact_id=?",
      [row[0].contact_id]
    );
    await dbConn.execute(
      "UPDATE `tbl_email_scheduler_rule_for_campaign` SET action='u',is_active=0 WHERE contact_id=?",
      [row[0].contact_id]
    );
    const [rows1] = await dbConn.execute(
      'INSERT INTO tbl_unsubscribe (company_id,campaign_id,email,reason,action) VALUES (?,?,?,?,?)',
      [req?.body?.company_id,req?.body?.campaign_id,req?.body?.email,req?.body?.reason,'c']
     
    );
    if (rows1.affectedRows === 1) {
      return res.status(201).json({
        message: "The contact has been unsubscribe.",
        success: true,
      });
    }

  } catch (err) {
    next(err);
  }
};



exports.getUnsubList = async (req, res, next) => {


  try {
  const userDetails = verifyJwt(req);

  console.log(userDetails)

    if (!req?.body?.fromDate || !req?.body?.toDate) {
      return res.json({
        message: "Provide required fields !",
      });
    }

   
    const [row] = await dbConn.execute(
      
      `SELECT campaign_name,email,reason,tu.created_at FROM tbl_unsubscribe tu
      INNER JOIN tbl_campaign cam ON tu.campaign_id = cam.campaign_id
      WHERE tu.company_id= ? AND tu.created_at BETWEEN ? AND ?`,
      [userDetails.companyId,req?.body?.fromDate, req?.body?.toDate]
    );

      return res.status(201).json({
        message: "unsubscribe list.",
        success: true,
        data:row
      });

  } catch (err) {
    next(err);
  }
};


const ContactDetailsBulk = async (filePath, ext, userDetail) => {
  try {
    const [row] = await dbConn.execute(
        "SELECT 1 FROM `sqm_reg_companies` WHERE `rc_id`=?",
        [userDetail.companyId]
    );

    if (row.length === 0) {
      return new Error("Invalid company_Id");
    }

    const [rowContact] = await dbConn.execute(
        "SELECT con_email AS email FROM `sqm_contact` WHERE con_company_id=? AND con_is_active=1 AND con_is_deleted=0",
        [userDetail.companyId]
    );
    let contacts;
    if (rowContact.length !== 0) {
      contacts = new Map([
        ...rowContact.map(row => [row.email, 1])
      ]);
    }
    //
      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (ext === 'csv') {
      const csvData = []; // Store CSV data here
      // Use csv-parser to parse the CSV file
      const csvParser = csv({
        mapHeaders: ({header}) => header.trim(),
        delimiter: ',',
      });
      let notAddedRec = [];
      await fs.createReadStream(filePath)
          .pipe(csvParser)
          .on('data', (row) => {
            csvData.push(row);
          })
          .on('end', async () => {
            let insertData = [];
            let sqlQuery = "";
            for (let data of csvData) {
              for (let key in data) {
                if (emailRegex.test(data[key])) {
                  if (!contacts || !contacts.has(data[key])) {
                    let bulkUploadContacts = {
                      "contactEmail": data[key],
                    }
                    bulkUploadContacts.userDetails = data;
                    // insertData.push("'" + JSON.stringify(bulkUploadContacts) + "'");
                    insertData.push(bulkUploadContacts);
                  } else {
                    notAddedRec.push(data);
                  }
                }
              }
            }
            sqlQuery = insertData.toString();
            if (insertData.length > 0) {
              try {
                const [rows] = await dbConn.execute(
                    'call import_contacts(?,?,?,?)',
                    [
                      JSON.stringify(JSON.stringify(insertData)),
                      userDetail.companyId, userDetail.userId, userDetail.userId,
                    ]
                );

                if (rows.affectedRows > 0) {
                  return {
                    message: "The contact details has been successfully inserted." + JSON.stringify(notAddedRec),
                    success: true,
                  };
                }
              } catch (e) {
                console.error("Mysql error:" + e)
                return new Error(e.message)
              }
            }
          })
          .on('error', (error) => {
            console.error('CSV parsing error:', error);
            return error;
          });
    }
  } catch (err) {
    return(err);
  }
};

