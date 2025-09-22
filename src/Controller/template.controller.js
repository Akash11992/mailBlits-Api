const { log } = require("handlebars");
const templateModel = require("../Models/template.model");
const { verifyJwt } = require("../Controller/jwtAuth");
const dbConn = require("../../config/db.config").promise();
const { buildEmailPrompt } = require("../prompts/emailTemplatePromtBuilder");
const { generateContent } = require("../service/open_ai_service");



const contactController = {
  getAllRunningVariable: async (req, res) => {
    try {
      // Check if the route is /getAllColumnVariable
      const isRouteCalled = req.originalUrl === "/getAllColumnVariable";

      const userDetails = verifyJwt(req);

      // const result = await templateModel.getAllRunningVariable(
      //   userDetails,
      //   req.body
      // );

      let [dbUser] = [];

      if (req.body.list_id != '' && req.body.list_id != null) {
        [dbUser] = await dbConn.execute(
          `SELECT contact_detail FROM tbl_contact_list_mapping clm
          RIGHT JOIN tbl_contact tc ON clm.contact_id=tc.contact_id
          LEFT JOIN tbl_list tl ON tl.list_id=clm.list_id 
          WHERE clm.company_id=? 
          AND tl.list_id=?`,
          [userDetails.companyId, req.body.list_id]
        );
      } else {
        [dbUser] = await dbConn.execute(
          `SELECT contact_detail FROM tbl_contact_list_mapping clm
          RIGHT JOIN tbl_contact tc ON clm.contact_id=tc.contact_id
          WHERE clm.company_id=?`,
          [userDetails.companyId]
        );
      }

      let keySet = new Set();

      for (let key of dbUser) {
        for (let innerkey of Object.values(key)) {
          for (let finalkey of Object.keys(innerkey)) {
            keySet.add(finalkey)
          }
        }
      }

      const allKeys = Array.from(keySet)

      if (isRouteCalled) {
        // Transform all unique keys into an array of objects
        const transformArray = allKeys.map((key) => {
          return { key: key.toLowerCase() };
        });
        res.json({
          success: true,
          error: false,
          message: "Running Variables fetched successfully!",
          data: transformArray,
          count: transformArray.length,
        });
      } else {
        // Transform all unique keys into an array of objects
        const transformArray = allKeys.map((key) => {
          return { key: `{{${key.toLowerCase()}}}` };
        });


        res.json({
          success: true,
          error: false,
          message: "Running Variables fetched successfully!",
          data: transformArray,
          count: transformArray.length,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  createTemplate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const body = req.body;
      const files = req.files; // Retrieve files array

      console.log(req.files.length);

      const imageUrl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}`;
      console.log(imageUrl);
      // console.log("userDetails", userDetails);
      const resposne = await templateModel.validateTemplateExistance(
        userDetails,
        body
      );
      console.log(resposne[0][0].response === "fail");
      // Respond with success message after all insertions
      //    console.log(result[0][0].response);
      if (resposne[0][0].response === "fail") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Template already exist!",
        });
      } else {
        console.log("inside else");
        const result = await templateModel.createTemplate(
          userDetails,
          body,
          files,
          imageUrl
        );

        res.json({
          success: true,
          error: false,
          message: "Emailer added successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  editExistingTemplate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const body = req.body;
      const files = req.files; // Retrieve files array

      console.log(req.files.length);

      const imageUrl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}`;
      console.log(imageUrl);
      // console.log("userDetails", userDetails);
      const response = await templateModel.EditTemplateNew(
        userDetails,
        body
      );

      // console.log("inside else",response);
      const result = await templateModel.UpdateTemplateAttchementsDocs(
        userDetails,
        body,
        files,
        imageUrl
      );

      res.json({
        success: true,
        error: false,
        message: "Emailer updated successfully!",
      });

    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getAllTemplate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await templateModel.getAllTemplate(userDetails);
      console.log("res", result[0][0].response);
      if (result[0][0].response === "fail") {
        res.json({
          success: false,
          error: true,
          message: "company_id does not exist!",
        });
      } else {
        res.json({
          success: true,
          error: false,
          message: "Templates fetched successfully!",
          data: result[0],
          count: result[1][0].count,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  getAllDocType: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await templateModel.getAllDocType();

      res.json({
        success: true,
        error: false,
        message: "Doc types fetched successfully!",
        data: result[0],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  editTemplate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const files = req.files;

      if (!req.body.templateId) {
        return res.status(400).send({
          message: "Invalid request !",
        });
      }

      const body = req.body;

      const resposne = await templateModel.editTemplate(userDetails, body);

      if (resposne[0][0].response === "fail") {
        res.status(400).json({
          success: false,
          error: true,
          message: "Template with this name already exist!",
        });
      } else {
        console.log("inside else");
        const result = await templateModel.editTemplateAttachmentMapping(
          userDetails,
          body,
          files
        );

        res.json({
          success: true,
          error: false,
          message: "Emailer added successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getTemplateById: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await templateModel.getTemplateById(
        userDetails,
        req.body.template_id
      );
      // Group data objects by template_id
      const groupedData = result[0].reduce((acc, obj) => {
        const key = obj.template_id;
        if (!acc[key]) {
          acc[key] = {
            //   ...obj, // Retain all keys from the original object

            template_id: obj.template_id,
            template_name: obj.template_name,
            template_description: obj.template_description,
            documents: [],
            template_attachments: [],
            allAttachmentList: [],
          };
        }

        // Combine documents
        if (
          obj.document_name !== null &&
          !acc[key].documents.some(
            (document) => document.document_name === obj.document_name
          )
        ) {
          let path = obj.document_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }

          acc[key].documents.push({
            document_name: obj.document_name,
            document_description: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_key: obj.password_key,
            documentType: obj.doc_format_type,
            documentPathUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`,
          });

          acc[key].allAttachmentList.push({
            attachmentName: obj.document_name,
            attachmentDescription: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            type: obj.doc_format_type,
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
            template_attachment_path: `${process.env.PROTOCOL}://${req.get(
              "host"
            )}/${path}`,
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
        message: "Template fetched successfully!",
        count: data.length,
        data: data,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  generateTemplate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      if (!userDetails) {
        throw new Error("Unauthorized");
      }
      const { query, template } = req.body;

      if(!query) {
        throw new Error("prompt is required");
      }

      const prompt = buildEmailPrompt(query, template);
      const response = await generateContent(prompt);

      if (response?.choices[0]?.message?.content) {
        const content = response?.choices[0]?.message?.content;
        res.json({
          success: true,
          data: content,
        });
      }
      else {
        throw new Error("Error generating template");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message, success: false });
    }
  },

  getFreeTepmlate: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      if (!userDetails) {
        throw new Error("Unauthorized");
      }
      if(!req.body.category_id && req.body.category_id.length == 0)
      {
        throw new Error("category id is required");
      }
      const result = await templateModel.getFreeTepmlateModel(req, res);
      if(result.length == 0)
      {
         throw new Error("Template details not found");
      }
      else
      {
         res.status(200).json({
          success:true,
          error:false,
          data:result
         })
      }
    }
    catch (err) {
      res.status(500).json({ message: err.message, success: false ,error:true});
    }
  }
};

module.exports = contactController;
