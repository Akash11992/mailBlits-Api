// route.js

const express = require("express");
const letterHeadController = require("../Controller/letterHead.controller");
const router = express.Router();
const multer = require("multer");
const { verifyJwt } = require("../Controller/jwtAuth");
const fs = require("fs");

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var userDetails = verifyJwt(req);
    const folderPath = `src/uploads/letterHeads/${userDetails.companyId}`;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath); // Destination folder for file uploads
  },
  filename: function (req, file, cb) {
    // Remove spaces from the filename
    const originalName = file.originalname;
    const modifiedName = originalName.replace(/\s+/g, ""); // Remove spaces
    cb(null, Date.now() + "-" + modifiedName); // Use the original filename
  },
});
const upload = multer({ storage: storage });
router.post(
  "/create",
  upload.single("letter_head_file"),
  letterHeadController.createLetterHead
);

router.post("/getAll", letterHeadController.getAllLetterHead);
router.delete("/delete", letterHeadController.DeleteLetterHead);
router.post("/get_by_id", letterHeadController.get_by_id);
router.put(
  "/update",
  upload.single("letter_head_file"),
  letterHeadController.updateLetterHead
);



router.post("/createHeader", letterHeadController.createHeader);
router.post("/createFooter", letterHeadController.createFooter);
router.post("/getAllHeader", letterHeadController.getAllHeader);
router.post("/getAllFooter", letterHeadController.getAllFooter);



module.exports = router;
