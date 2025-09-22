// route.js

const express = require('express');
const templatetController = require('../Controller/template.controller');
const router = express.Router();
const multer = require('multer');
const { verifyJwt } = require("../Controller/jwtAuth");
const fs = require('fs');
const { body } = require("express-validator");
const {getTemplateAndDocument,getPreview,CloneTemplate,DeleteTemplate,EditTemplate,DeleteDocument,
    CloneDocument,EditDocument,EditHeader,EditFooter,DeleteHeader,DeleteFooter} = require('../Controller/DB/templates')

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var userDetails = verifyJwt(req);
        const folderPath = `src/uploads/template_attachments/${userDetails.companyId}`;

        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath,{ recursive: true });
        }
        cb(null, folderPath); // Destination folder for file uploads
    },
    filename: function (req, file, cb) {
        // console.log("file")
        // console.log(file)
 // Remove spaces from the filename
 const originalName = file.originalname;
 const modifiedName = originalName.replace(/\s+/g, ''); // Remove spaces
        cb(null, Date.now()+'-'+modifiedName); // Use the original filename
    }
});
const upload = multer({ storage: storage });
router.post('/getAllRunningVariable', templatetController.getAllRunningVariable);
router.post('/createTemplate', upload.array('attachments'), templatetController.createTemplate);
router.put('/editExistingTemplate', upload.array('attachments'), templatetController.editExistingTemplate);

router.post('/getAllTemplate', getTemplateAndDocument);
router.post('/getAllFreeTemplate', templatetController.getFreeTepmlate);
router.post('/getPreview', getPreview);
router.get('/getAllColumnVariable', templatetController.getAllRunningVariable);
router.get('/getAllDocType', templatetController.getAllDocType);

router.post("/clone-template",[
    body("templateId", "Template id missing").notEmpty().escape()
  ], CloneTemplate);

  router.post("/delete-template", DeleteTemplate);
  router.post("/edit-template", templatetController.editTemplate);

  router.post('/getTemplateByCidTempId', templatetController.getTemplateById);
  router.post("/delete-document", DeleteDocument);
  router.post("/clone-document", CloneDocument);
  router.post("/edit-document", EditDocument);

  router.post("/edit-header", EditHeader);
  router.post("/edit-footer", EditFooter);

  router.post("/delete-header", DeleteHeader);
  router.post("/delete-footer", DeleteFooter);

module.exports = router;
