const { log } = require("handlebars");
const schedulerModel = require("../Models/scheduler.model");
const { verifyJwt } = require("../Controller/jwtAuth");
const CryptoJS = require('crypto-js');
const schedulerController = {
  getAllEmailSchedule: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      if (!req.body.status_type_id || !req.body.page_number || !req.body.pageSize) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Please provide required fields",
        });
      }
      const result = await schedulerModel.getAllEmailSchedule(
        userDetails,
        req.body.status_type_id,
        req.body.page_number,
        req.body.pageSize,
        req.body.campaign_id
      );
      //  old............................................................
      // const transformedData = result[0].map((item) => {
      //   const newItem = {};
      //   for (const key in item) {
      //     const lowercaseKey = key.toLowerCase(); // Convert key to lowercase
      //     if (lowercaseKey !== "contact_detail") {
      //       newItem[lowercaseKey] =
      //         typeof item[key] === "string"
      //           ? item[key].toLowerCase()
      //           : item[key];
      //     } else {
      //       const contactDetail = item.contact_detail;
      //       for (const detailKey in contactDetail) {
      //         newItem[detailKey.toLowerCase()] =
      //           typeof contactDetail[detailKey] === "string"
      //             ? contactDetail[detailKey].toLowerCase()
      //             : contactDetail[detailKey]; // Convert detailKey to lowercase and its value
      //       }
      //     }
      //   }
      //   return newItem;
      // });

      // transformedData.forEach((obj) => {
      //   // Use regular expression to match any placeholder within double curly braces
      //   obj.description = obj.description?.replace(
      //     /\{\{([^{}]+)\}\}/g,
      //     (match, key) => {
      //       // Check if the key exists in the object
      //       if (obj.hasOwnProperty(key.trim())) {
      //         // Replace the placeholder with the corresponding value
      //         return obj[key.trim()];
      //       }
      //       // If the key doesn't exist, return the original placeholder
      //       return match;
      //     }
      //   );

      //   // Check if the value matches the email regex pattern
      //   for (const key in obj) {
      //     // console.log(key);
      //     if (key === 'recipients_email' && isEmail(obj[key])) {
      //       // If it's an email, rename the key to "display_email"
      //       obj["display_email"] = obj[key];
      //       delete obj[key]; // Remove the original key
      //     }
      //   }
      // });

      //  new............................................................
      // Group data objects by scheduler_rule_id

      let totalCount = 0;
      let filteredRecords = 0;

      if (result.length > 0) {
        if (result[0].length > 0) {
          totalCount = result[0][0].total_records;
          filteredRecords = result[0][0].filtered_records;
        }
      }

      const groupedData = result[0].reduce((acc, obj) => {
        // console.log(obj)
        let sendTime = new Date(obj.send_email_date).toString();
        let year = new Date(obj.send_email_date).getFullYear()

        const stringWithoutHtml = removeHtmlTags(obj.description);

        const datePart = sendTime.slice(0, 10);

        const concatenatedDate = datePart + ' ' + year + ' ' + obj.scheduler_time;

        // console.log(obj.send_email_date, obj.scheduler_time);
        const key = obj.scheduler_rule_id;
        if (!acc[key]) {
          acc[key] = {
            //   ...obj, // Retain all keys from the original object

            scheduler_rule_id: obj.scheduler_rule_id,
            company_id: obj.company_id,
            send_email_date: concatenatedDate,
            send_email_time: obj.scheduler_time,
            campaign_id: obj.campaign_id,
            campaign_name: obj.campaign_name,
            subject: obj.subject,
            template_name: obj.template_name,
            template_description: stringWithoutHtml,
            recipients_email: obj.recipients_email,
            sender_email: obj.sender_email,
            cc: obj.cc,
            bcc: obj.bcc,
            contact_detail: obj.contact_detail,
            email_status: obj.email_status,
            campaign_attachments: [
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/image.png`
              // },
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/employee_offer.pdf`
              // }
            ],
            documents: [],
            template_attachments: [],

          };
          delete acc[key].scheduler_time; // Optionally remove scheduler_time key
        }
        // Combine campaign attachments
        if (
          obj.campaign_attachment_name !== null &&
          !acc[key].campaign_attachments.some(
            (attachment) =>
              attachment.campaign_attachment_name ===
              obj.campaign_attachment_name
          )
        ) {
          let path = obj.campaign_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].campaign_attachments.push({
            campaign_attachment_name: obj.campaign_attachment_name,
            campaign_attachment_type: obj.campaign_attachment_type,
            campaign_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        // Combine documents
        if (
          obj.document_name !== null &&
          !acc[key].documents.some(
            (document) => document.document_name === obj.document_name
          )
        ) {
          let docType = "PDF";
          if (obj.doc_format_id == 1) {
            docType = "PDF";
          } else {
            docType = "DOC/DOCX";
          }
          let path = obj.doc_path_url;

          if (path) {
            path = path.replace(/\\/g, "/");
          }

          acc[key].documents.push({
            document_name: obj.document_name,
            document_description: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            documentType: docType,
            documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
            // documentPathUrl:"http://mailblitzapi.cylsys.com/src/uploads/Campaign/12/employee_offer.pdf"
          });
        }
        //combine template attachments
        if (
          obj.template_attachment_name !== null &&
          !acc[key].template_attachments.some(
            (attachment) =>
              attachment.template_attachment_name ===
              obj.template_attachment_name
          )
        ) {
          let path = obj.template_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].template_attachments.push({
            template_attachment_name: obj.template_attachment_name,
            template_attachment_type: obj.template_attachment_type,
            template_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        return acc;
      }, {});

      // Convert grouped data back to an array
      const data = Object.values(groupedData);

      data.sort((a, b) => {
        return b?.scheduler_rule_id - a?.scheduler_rule_id;
      });

      res.json({
        success: true,
        error: false,
        message: "Scheduler Details fetched successfully!",
        count: totalCount,
        filteredRecords: filteredRecords,
        data: data,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },


  getAllEmailScheduleForMailSending: async (req, res) => {
    try {

      const result = await schedulerModel.getAllEmailScheduleForMailSending(
        req.body.email_status_id
        // userDetails
      );

      // Group data objects by scheduler_rule_id
      const groupedData = result[0].reduce((acc, obj) => {
        // console.log("...", obj)

        if (obj.isEmailTrackingEnabled == 1) {
          obj.template_description = obj.template_description + '<img src="mailblitzTracker.jpg" width="1px" height="1px">'
        }

        let sendTime = new Date(obj.send_email_date).toString();
        let year = new Date(obj.send_email_date).getFullYear()

        const datePart = sendTime.slice(0, 10);

        const concatenatedDate = datePart + ' ' + year + ' ' + obj.scheduler_time;

        var date = new Date(concatenatedDate);

        var formattedDate = date.toISOString();


        const key = obj.scheduler_rule_id;
        console.log("....pass", obj?.oauthPayload?.password);

        let decryptedPassword = null;
        if (obj?.oauthPayload?.password === null ||  obj?.oauthPayload?.password === undefined) {
          // console.log(decryptedPassword, "decryptedPassword");
        } else {
          decryptedPassword = CryptoJS.AES.decrypt(obj?.oauthPayload?.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
          // console.log(decryptedPassword, "decryptedPassword");
          if (obj?.oauthPayload?.password) {
            obj.oauthPayload.password = decryptedPassword;
        }
          

        }
        if (!acc[key]) {
          acc[key] = {

            scheduler_rule_id: obj.scheduler_rule_id,
            company_id: obj.company_id,
            send_email_date: formattedDate.split('T')[0],
            send_email_time: obj.scheduler_time,
            campaign_id: obj.campaign_id,
            campaign_name: obj.campaign_name,
            subject: obj.subject,
            template_name: obj.template_name,
            template_description: obj.template_description,
            add_unsubscribe: obj.add_unsubscribe,
            recipients_email: obj.recipients_email,
            sender_email: obj.sender_email,
            providerName: obj.providerName,
            providerId: obj.providerId,
            oAuthPayload: obj.oauthPayload,
            cc: obj.cc,
            bcc: obj.bcc,
            contact_detail: obj.contact_detail,
            email_status: obj.email_status,
            isEmailTrackingEnabled: obj.isEmailTrackingEnabled,
            campaign_attachments: [
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/image.png`
              // },
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/employee_offer.pdf`
              // }
            ],
            documents: [],
            template_attachments: [],
            allAttachmentList: []
          };
          delete acc[key].scheduler_time; // Optionally remove scheduler_time key
        }
        // Combine attachments
        if (
          obj.campaign_attachment_name !== null &&
          !acc[key].campaign_attachments.some(
            (attachment) =>
              attachment.campaign_attachment_name ===
              obj.campaign_attachment_name
          )
        ) {
          let path = obj.campaign_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].campaign_attachments.push({
            campaign_attachment_name: obj.campaign_attachment_name,
            campaign_attachment_type: obj.campaign_attachment_type,
            campaign_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });

          acc[key].allAttachmentList.push({
            attachmentName: obj.campaign_attachment_name,
            type: obj.campaign_attachment_type,
            pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        // Combine documents
        if (
          obj.document_name !== null &&
          !acc[key].documents.some(
            (document) => document.document_name === obj.document_name
          )
        ) {
          let docType = "PDF";
          if (obj.doc_format_id == 1) {
            docType = "PDF";
          } else {
            docType = "DOC/DOCX";
          }
          let path = obj.doc_path_url;

          if (path) {
            path = path.replace(/\\/g, "/");
          }

          acc[key].documents.push({
            document_name: obj.document_name,
            document_description: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            documentType: docType,
            documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
            // documentPathUrl:"http://mailblitzapi.cylsys.com/src/uploads/Campaign/12/employee_offer.pdf"
          });


          acc[key].allAttachmentList.push({
            attachmentName: obj.document_name,
            attachmentDescription: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            type: docType,
            pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        //combine template attachments
        if (
          obj.template_attachment_name !== null &&
          !acc[key].template_attachments.some(
            (attachment) =>
              attachment.template_attachment_name ===
              obj.template_attachment_name
          )
        ) {
          let path = obj.template_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].template_attachments.push({
            template_attachment_name: obj.template_attachment_name,
            template_attachment_type: obj.template_attachment_type,
            template_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });


          acc[key].allAttachmentList.push({
            attachmentName: obj.template_attachment_name,
            type: obj.template_attachment_type,
            pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });

        }
        return acc;
      }, {});

      // Convert grouped data back to an array
      const data = Object.values(groupedData);
      res.json({
        success: true,
        error: false,
        message: "Scheduler Details fetched successfully!",
        count: data.length,
        data: data,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  // getAllEmailScheduleForMailSending: async (req, res) => {
  //   try {

  //     const result = await schedulerModel.getAllEmailScheduleForMailSending(
  //       req.body.email_status_id
  //       // userDetails
  //     );

  //     // Group data objects by scheduler_rule_id
  //     const groupedData = result[0].reduce((acc, obj) => {
  //       console.log(obj)

  //       if(obj.isEmailTrackingEnabled == 1){
  //         obj.template_description = obj.template_description+'<img src="mailblitzTracker.jpg" width="1px" height="1px">'
  //       }

  //       // let sendTime = new Date(obj.send_email_date).toString();
  //       // let year = new Date(obj.send_email_date).getFullYear()

  //       // const datePart = sendTime.slice(0, 10);

  //       // const concatenatedDate = datePart+' '+year + ' ' + obj.scheduler_time;

  //       // var date = new Date(concatenatedDate);

  //       // var formattedDate = date.toISOString();

  //       const sendTime = new Date(obj.send_email_date).toString();
  //       const year = new Date(obj.send_email_date).getFullYear();
  //       const concatenatedDate = `${sendTime.slice(0, 10)} ${year} ${obj.scheduler_time}`;
  //       const formattedDate = new Date(concatenatedDate).toISOString().split('T')[0];



  //       const key = obj.scheduler_rule_id;
  //       if (!acc[key]) {
  //         acc[key] = {

  //         scheduler_rule_id: obj.scheduler_rule_id,
  //         company_id: obj.company_id,
  //         send_email_date: formattedDate,
  //         send_email_time: obj.scheduler_time,
  //         campaign_id: obj.campaign_id,
  //         campaign_name: obj.campaign_name,
  //         subject: obj.subject,
  //         template_name: obj.template_name,
  //         template_description: obj.template_description,
  //         recipients_email: obj.recipients_email,
  //         sender_email: obj.sender_email,
  //         oAuthPayload: obj.oauthPayload,
  //         providerName: obj.providerName,
  //         providerId: obj.providerId,
  //         cc: obj.cc,
  //         bcc: obj.bcc,
  //         contact_detail: obj.contact_detail,
  //         email_status: obj.email_status,
  //         isEmailTrackingEnabled: obj.isEmailTrackingEnabled,
  //         campaign_attachments: [],
  //         documents: [],
  //         template_attachments: [],
  //         allAttachmentList: []
  //         };
  //       }

  //       const processAttachment = (type, name, path, list) => {
  //         if (name && !list.some(item => item[type] === name)) {
  //           const formattedPath = path ? path.replace(/\\/g, "/") : '';
  //           list.push({
  //             [type]: name,
  //             [type + '_type']: obj[`${type}_type`],
  //             [type + '_path']: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${formattedPath}`
  //           });
  //           acc[key].allAttachmentList.push({
  //             attachmentName: name,
  //             type: obj[`${type}_type`],
  //             pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${formattedPath}`
  //           });
  //         }
  //       };

  //       processAttachment('campaign_attachment', obj.campaign_attachment_name, obj.campaign_attachment_path, acc[key].campaign_attachments);
  //       processAttachment('template_attachment', obj.template_attachment_name, obj.template_attachment_path, acc[key].template_attachments);

  //       if (obj.document_name) {
  //         const docType = obj.doc_format_id == 1 ? 'PDF' : 'DOC/DOCX';
  //         const formattedPath = obj.doc_path_url ? obj.doc_path_url.replace(/\\/g, "/") : '';
  //         acc[key].documents.push({
  //           document_name: obj.document_name,
  //           document_description: obj.document_description,
  //           is_password_protected: obj.is_password_protected,
  //           password_value: obj.password_value,
  //           documentType: docType,
  //           documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${formattedPath}`
  //         });
  //         acc[key].allAttachmentList.push({
  //           attachmentName: obj.document_name,
  //           attachmentDescription: obj.document_description,
  //           is_password_protected: obj.is_password_protected,
  //           password_value: obj.password_value,
  //           type: docType,
  //           pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${formattedPath}`
  //         });
  //       }

  //       return acc;
  //     }, {});



  //       // Combine attachments
  //     //   if (
  //     //     obj.campaign_attachment_name !== null &&
  //     //     !acc[key].campaign_attachments.some(
  //     //       (attachment) =>
  //     //         attachment.campaign_attachment_name ===
  //     //         obj.campaign_attachment_name
  //     //     )
  //     //   ) {
  //     //     let path = obj.campaign_attachment_path;

  //     //     if (path) {
  //     //       path = path.replace(/\\/g, "/");
  //     //     }
  //     //     acc[key].campaign_attachments.push({
  //     //       campaign_attachment_name: obj.campaign_attachment_name,
  //     //       campaign_attachment_type: obj.campaign_attachment_type,
  //     //       campaign_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //     });

  //     //     acc[key].allAttachmentList.push({
  //     //       attachmentName: obj.campaign_attachment_name,
  //     //       type: obj.campaign_attachment_type,
  //     //       pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //     });
  //     //   }


  //     //   // Combine documents
  //     //   if (
  //     //     obj.document_name !== null &&
  //     //     !acc[key].documents.some(
  //     //       (document) => document.document_name === obj.document_name
  //     //     )
  //     //   ) {
  //     //     let docType = "PDF";
  //     //     if (obj.doc_format_id == 1) {
  //     //       docType = "PDF";
  //     //     } else {
  //     //       docType = "DOC/DOCX";
  //     //     }
  //     //     let path = obj.doc_path_url;

  //     //     if (path) {
  //     //       path = path.replace(/\\/g, "/");
  //     //     }

  //     //     acc[key].documents.push({
  //     //       document_name: obj.document_name,
  //     //       document_description: obj.document_description,
  //     //       is_password_protected: obj.is_password_protected,
  //     //       password_value: obj.password_value,
  //     //       documentType: docType,
  //     //       documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //       // documentPathUrl:"http://mailblitzapi.cylsys.com/src/uploads/Campaign/12/employee_offer.pdf"
  //     //     });


  //     //     acc[key].allAttachmentList.push({
  //     //       attachmentName: obj.document_name,
  //     //       attachmentDescription: obj.document_description,
  //     //       is_password_protected: obj.is_password_protected,
  //     //       password_value: obj.password_value,
  //     //       type: docType,
  //     //       pathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //     });
  //     //   }
  //     //   //combine template attachments
  //     //   if (
  //     //     obj.template_attachment_name !== null &&
  //     //     !acc[key].template_attachments.some(
  //     //       (attachment) =>
  //     //         attachment.template_attachment_name ===
  //     //         obj.template_attachment_name
  //     //     )
  //     //   ) {
  //     //     let path = obj.template_attachment_path;

  //     //     if (path) {
  //     //       path = path.replace(/\\/g, "/");
  //     //     }
  //     //     acc[key].template_attachments.push({
  //     //       template_attachment_name: obj.template_attachment_name,
  //     //       template_attachment_type: obj.template_attachment_type,
  //     //       template_attachment_path:`${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //     });


  //     //     acc[key].allAttachmentList.push({
  //     //       attachmentName: obj.template_attachment_name,
  //     //       type: obj.template_attachment_type,
  //     //       pathUrl:`${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
  //     //     });

  //     //   }
  //     //   return acc;
  //     // }, {});

  //     // Convert grouped data back to an array
  //     const data = Object.values(groupedData);
  //     res.json({
  //       success: true,
  //       error: false,
  //       message: "Scheduler Details fetched successfully!",
  //       count: data.length,
  //       data: data,
  //     });
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //     res.status(500).json({ message: err.message });
  //   }
  // },

  getAllEmailLogs: async (req, res) => {
    try {

      console.log("inside all logs=========")
      // const userDetails = verifyJwt(req);
      // let page_number = req.body.page_number;
      // if(!req.body.company_id){
      //   return res.status(400).json({
      //     success: false,
      //     error: true,
      //     message: "Please provide company_id",
      //   });
      // }
      const result = await schedulerModel.getAllEmailLogs(
        req.body.company_id,
        req.body.campaign_id,
        req.body.contact_id,
        req.body.email_date,
        req.body.scheduler_time,
        req.body.email_status_id
        // page_number
      );

      // Group data objects by scheduler_rule_id
      const groupedData = result[0].reduce((acc, obj) => {
        let sendTime = new Date(obj.send_email_date).toString();
        let year = new Date(obj.send_email_date).getFullYear()
        console.log("sendTime", sendTime);
        const datePart = sendTime.slice(0, 10);

        const concatenatedDate = datePart + ' ' + year + ' ' + obj.scheduler_time;
        // Create a Date object from the given string
        var date = new Date(concatenatedDate);

        // Convert the date to the desired format (YYYY-MM-DDTHH:MM:SSZ)
        var formattedDate = date.toISOString();

        // Output the formatted date
        console.log(formattedDate); // Output: "2024-04-22T11:03:43.000Z"
        // console.log(typeof obj.send_email_date, obj.scheduler_time);
        const key = obj.scheduler_rule_id;
        if (!acc[key]) {
          acc[key] = {
            //   ...obj, // Retain all keys from the original object

            scheduler_rule_id: obj.scheduler_rule_id,
            company_id: obj.company_id,
            send_email_date: formattedDate.split('T')[0],
            send_email_time: obj.scheduler_time,
            campaign_id: obj.campaign_id,
            campaign_name: obj.campaign_name,
            subject: obj.subject,
            template_name: obj.template_name,
            template_description: obj.template_description,
            recipients_email: obj.recipients_email,
            sender_email: obj.sender_email,
            cc: obj.cc,
            bcc: obj.bcc,
            contact_detail: obj.contact_detail,
            email_status: obj.email_status,
            campaign_attachments: [
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/image.png`
              // },
              // {
              //   attachmentPathUrl:`${process.env.PROTOCOL}://${req.get('host')}/src/uploads/Campaign/12/employee_offer.pdf`
              // }
            ],
            documents: [],
            template_attachments: []
          };
          delete acc[key].scheduler_time; // Optionally remove scheduler_time key
        }
        // Combine attachments
        if (obj.campaign_attachment_name !== null &&
          !acc[key].campaign_attachments.some(
            (attachment) =>
              attachment.campaign_attachment_name ===
              obj.campaign_attachment_name
          )) {
          let path = obj.campaign_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].campaign_attachments.push({
            campaign_attachment_name: obj.campaign_attachment_name,
            campaign_attachment_type: obj.campaign_attachment_type,
            campaign_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        // Combine documents
        if (obj.document_name !== null &&
          !acc[key].documents.some(
            (document) => document.document_name === obj.document_name
          )) {
          let docType = "PDF";
          if (obj.doc_format_id == 1) {
            docType = "PDF";
          } else {
            docType = "DOC/DOCX";
          }
          let path = obj.doc_path_url;

          if (path) {
            path = path.replace(/\\/g, "/");
          }

          acc[key].documents.push({
            document_name: obj.document_name,
            // document_description: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            documentType: docType,
            documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
            // documentPathUrl:"http://mailblitzapi.cylsys.com/src/uploads/Campaign/12/employee_offer.pdf"
          });
        }

        //combine template attachments
        if (
          obj.template_attachment_name !== null &&
          !acc[key].template_attachments.some(
            (attachment) =>
              attachment.template_attachment_name ===
              obj.template_attachment_name
          )
        ) {
          let path = obj.template_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].template_attachments.push({
            template_attachment_name: obj.template_attachment_name,
            template_attachment_type: obj.template_attachment_type,
            template_attachment_path: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });
        }
        return acc;
      }, {});
      const data = Object.values(groupedData);

      for (let d of data) {
        let arr = [];
        arr = arr.concat(d.campaign_attachments, d.documents, d.template_attachments)
        // console.log(d)
        d.allAttachmentList = arr

      }

      // Convert grouped data back to an array
      res.json({
        success: true,
        error: false,
        message: "Scheduler Details fetched successfully!",
        count: data.length,
        data: data,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getBounceInfo: async (req, res) => {
    try {
      const result = await schedulerModel.getBounceInfo();
      // console.log("....pass",result[0]);
      result[0].forEach((e) => {
        if (e.email_date) {
          // Convert email_date to ISO string and extract only the date part
          let emailDate = new Date(e.email_date).toISOString().slice(0, 10);
          console.log("Email Date:", emailDate);
      
          // Update the email_date field with just the date if needed
          e.email_date = emailDate;
        }
        if(e?.OAuth_Payload?.password){
          let decryptedPassword = null;
          if (e?.OAuth_Payload?.password === null ||e?.OAuth_Payload?.password === undefined) {
            // console.log(decryptedPassword, "decryptedPassword");
          } else {
            decryptedPassword = CryptoJS.AES.decrypt(e?.OAuth_Payload?.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
            // console.log(decryptedPassword, "decryptedPassword");
            if (e?.OAuth_Payload?.password) {
              e.OAuth_Payload.password = decryptedPassword;
          }
        }
     } })
     
    
      res.json({
        success: true,
        error: false,
        message: "Bounce info fetched successfully!",
        count: result[0].length,
        data: result[0],
      });
    
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
};
function isEmail(str) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str);
}


function removeHtmlTags(str) {
  // Remove HTML tags

  let cleanStr = str;

  if (str) {
    cleanStr = str.replace(/<[^>]*>/g, ' ');
    // Remove encoded characters
    cleanStr = cleanStr.replace(/&#[0-9]+;/g, ' ');

    cleanStr = cleanStr.replace(/\s+/g, ' ');
  }

  return cleanStr;
}

module.exports = schedulerController;
