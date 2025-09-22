// route.js

const express = require('express');
const campaignController = require('../Controller/campaign.controller');
const router = express.Router();
const multer = require('multer');
const { verifyJwt } = require("../Controller/jwtAuth");
const fs = require('fs');

const {setCampaignStatus,deleteCampaign,cloneCampaign,editCampaign,getCampaignById,downloadZip} = require('../Controller/DB/campaign')


// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var userDetails = verifyJwt(req);
        const folderPath = `src/uploads/campaign_attachments/${userDetails.companyId}`;
        if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath,{ recursive: true });
        }
        cb(null, folderPath); // Destination folder for file uploads
    },
    filename: function (req, file, cb) {
 // Remove spaces from the filename
 const originalName = file.originalname;
 const modifiedName = originalName.replace(/\s+/g, ''); // Remove spaces
        cb(null, Date.now()+'-'+modifiedName); // Use the original filename
    }
});
const upload = multer({ storage: storage });
router.post('/create', upload.array('attachment',), campaignController.createCampaign);
router.get('/getAll', campaignController.getAllCampaign);
router.post('/getCampaignById', getCampaignById);
router.get('/getAllCountriesTimezone', campaignController.getAllCountriesTimezone);
router.get('/getAllDays', campaignController.getAllDays);
router.get('/getActiveCampaigns', campaignController.getActiveCampaigns);

router.post('/setCampaignStatus', setCampaignStatus);
router.post('/deleteCampaign', deleteCampaign);
router.post('/clone-campaign', cloneCampaign);
router.post('/edit-campaign', editCampaign);
router.post('/download-campaign-zip', downloadZip);

module.exports = router;
