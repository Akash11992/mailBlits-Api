const router = require("express").Router();
const { body } = require("express-validator");
const { register,verifyMail,verifyMailByAdmin } = require("../login controllers/registerController.js");
const  {login}  = require("../login controllers/loginController.js");
const {getUser} = require('../login controllers/getUserController_notused.js');
const { getUserName } = require("../login controllers/getcontroller.js");
const {
  CompanyRegistration, GetIndustryTypes, GetEmployeeCount, GetTaxTypes,GetCompanyDetailsById,GetCompanyType,
  AddBusiness,
  EditBusiness,
  ActivateBusiness,
  DeactivateBusiness,
  GetBusiness,
  DeleteBusiness,
  SubCompanyRegistration,
  GetCompanyDetailsByGroupName,
  EditSubCompany,
  DeleteSubCompany
} = require("../login controllers/CompanyRegistration.js");
const { ContactDetails } = require("../Controller/Contact/Contact.js");
const {
  ContactDetailsEdit,
} = require("../Controller/Contact/Contact.js");
const {
  ContactUnSubscribe,getUnsubList
} = require("../Controller/Contact/Contact.js");
const { GetContactDetails } = require("../login controllers/GetContactDetails");
const { Get_TodayContactDetails } = require("../login controllers/GetContactDetails");
const { GetContactEmails } = require("../login controllers/GetContactDetails");
const { GetAllContactDetails } = require("../login controllers/GetAllContactDetails");
const { GetAllContactEmails } = require("../login controllers/GetAllContactDetails");

const { UserRoles } = require("../login controllers/UserRoleMaster.js");
// const{Campaign}=require('../login controllers/UserRoleMaster.js')
const { Campaign } = require("../login controllers/Campaign.js");
const { CampaignDetailsEdit } = require("../login controllers/Campaign.js");
const { GetCampaignUserId } = require("../login controllers/Campaign.js");
const { CreateSegment } = require("../login controllers/Segment.js");
const { UpdateSegment, GetSegmentCategoriesbyUserId, GetSegmentCriterias} = require("../login controllers/Segment");
const { GetSegmentbyId } = require("../login controllers/Segment.js");
const { GetSegmentbyUserId } = require("../login controllers/Segment.js");
const { getSegment } = require("../login controllers/getSegment");

const { Template } = require("../login controllers/Template.js");

const { getAllfieldName } = require("../login controllers/Template.js");
const { Mail } = require('../login controllers/Mail');
const{Fileupload}=require('../login controllers/Fileupload.js');
const{List}=require('../login controllers/List.js');
const {linkMailbox,UnlinkMailbox,getMailboxList,refreshToken,linkGmail,getBounceInfo, linkOthermail, getProtocolTypes} = require('../Controller/DB/mailbox.js')
const{NewCampaign}=require('../Controller/NewCampaign.js');
const{UpdateCampaign}=require('../Controller/NewCampaign.js');
const{getAllCampaign}=require('../Controller/NewCampaign.js');
const{GetCampaignByUserId}=require('../Controller/NewCampaign.js');
const{GetCampaignDataByCampaignId}=require('../login controllers/Campaign.js');
const{GetEmailDetails}=require('../Controller/GetEmailDetails.js');
const{GetStateDetails}=require('../Controller/GetEmailDetails.js');
const{getAllCountry}=require('../Controller/GetEmailDetails.js');
const{GetCityDetails}=require('../Controller/GetEmailDetails.js');
const{forget}=require('../Controller/forget.js');
const {
  getScheduler,
  addScheduler,
  getAllScheduler,
  updateScheduler,
} = require("../login controllers/Scheduler");

const { getAllUser } = require("../Controller/GetContact");
const {
  EditCompanyRegistration,
} = require("../login controllers/CompanyRegistration");
//const{getAllUser}=require('../login controllers/')
const {
  getUserCompanyDataByUserId,
  updateUserByUserId,
} = require("../login controllers/userDetailsWithCompanyData");
const {
  addList_of_TimeZone,
  getTimeZone,
  addTimeZone,
  updateTimeZone,
} = require("../TimeZone/TimeZone");

const {
  ChangePassword,
} = require("../login controllers/changePassword/changePassword");
const {bulkUpload} = require("../Controller/Contact/Contact.js");
const multer = require("multer");
const path = require("path");
const {GetAllDesignations} = require("../Controller/GeneralService");
const {GetAllCountryCode} = require("../Controller/GeneralService");

const {getAllTimezones, GetEmailProvidersList} = require("../Controller/GetEmailDetails");
const {GetCampaignTypes, TestEmailCredentials} = require("../login controllers/Campaign");
const {GetBatchMaster} = require("../Controller/NewCampaign");
const {GetRoles,GetRoleById,CreateRoles,UpdateRoles,DeleteRoles,CreateUser,GetUserByCompany,UpdateUser,GetUserByUserId,UpdatePassword,DeleteUser,UpdateSelfPassword, GetSubCompanyRoles} = require("../Controller/User/User.controller.js")
const {GetTemplates,GetTemplateById,CreateTemplate,UpdateTemplate,DeleteTemplate,CloneTemplate,getTemplateType,addDocument,getDocument} = require("../Controller/Email/Email.js");
const {requestForGetPassword,resetPassword,getProfileOverview,editProfile,changePassword} = require('../Controller/DB/profileManagement.js')
const { log } = require("console");
const fs = require('fs');





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder to the 'upload' folder in the same directory as the controller file
        cb(null, path.join(__dirname, 'upload'));
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000, // 100MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and XLSX files are allowed'));
        }
    },
});

//done
router.get("/designations", GetAllDesignations);
//done
router.get("/getcountrycode", GetAllCountryCode);
//done
router.post(
  "/registerUser",
  [
    body("Name", "The name must be of minimum 3 characters length")
      .notEmpty()
      .escape()
      .trim()
      .isLength({ min: 3 }),

    body("Email", "Invalid email address").notEmpty().escape().trim().isEmail(),

    body("Password", "The Password must be of minimum 4 characters length")
      .notEmpty()
      .trim()
      .isLength({ min: 4 }),
  ],
  register
);

//done
router.post(
  "/forgot-password",
  [
    body("email", "Invalid email address").notEmpty().escape().trim().isEmail()
  ],
  requestForGetPassword
);

//done
router.post(
  "/reset-password",
  [
    body("code", "Invalid code").notEmpty().escape().trim(),
    body("password", "Provide required fields").notEmpty().escape().trim(),
  ],
  resetPassword
);

//done
router.get('/get-overview',getProfileOverview);


router.post(
  "/edit-profile",
  [
    body("name", "Name is required").notEmpty().escape().trim(),
  ],
  editProfile
);


//already reset password done
router.post(
  "/change-password",
  [
    body("oldPassword", "old password is required").notEmpty().escape().trim(),
    body("newPassword", "new password is required").notEmpty().escape().trim(),
  ],
  changePassword
);


//done
router.get(
  "/user/verify/:userId/:uniqueString",
  verifyMail
);

//done
router.get(
  "/admin/verify/:userId/:uniqueString",
  verifyMailByAdmin
);



router.post(
  "/login",
  [
    body("Email", "Invalid Email address").notEmpty().escape().trim().isEmail(),
    body("Pas", "The Password must be of minimum 4 characters length")
      .notEmpty()
      .trim()
      .isLength({ min: 4 }),
  ],
  login
);

router.post("/campaign/testMail/", TestEmailCredentials);


router.get("/getUser", getUser);

router.get("/getoneuser/:Email", getUserName);


//COMPANY REGISTRATION

//done
router.get("/getIndutryTypes", GetIndustryTypes);
router.get("/getEmployeeCount", GetEmployeeCount);
router.get("/getCompanyType", GetCompanyType);

router.post("/getTaxTypes", GetTaxTypes);
router.post("/getCompanyById", GetCompanyDetailsById);
router.post("/getCompanyByGroupName", GetCompanyDetailsByGroupName);

const { verifyJwt } = require("../Controller/jwtAuth.js");


const imgStorage = multer.diskStorage({

  destination:function(req,file,callback){

    const userDetails = verifyJwt(req);
    const destinationDir = path.join("./src/uploads/company_logo/", userDetails.user_id.toString());

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    callback(null,"./src/uploads/company_logo/"+userDetails.user_id)
  },

  
  filename:function(req,file,callback){
    const ext = file.originalname.split(".").pop();
    const companyName = req.body.companyName.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${companyName}-${Date.now()}.${ext}`;

    callback(null,fileName);
  }
})

const imguploads = multer({ storage: imgStorage });

router.post(
  "/register-company",
  [
    body("companyName", "Company name required.")
      .notEmpty()
      .escape()
      .trim(),

    body("companyEmail", "Email required.")
      .notEmpty()
      .escape()
      .trim()
      .isEmail(),

      body("portal", "portal required.")
      .notEmpty()
      .escape()
      .trim(),

      body("industryId", "Please select industry.")
      .notEmpty()
      .escape()
      .trim(),

      body("employeeCountId", "Employee count required.")
      .notEmpty()
      .escape()
      .trim(),

      body("countryId", "Country required.")
      .notEmpty()
      .escape()
      .trim(),

      body("stateId", "State required.")
      .notEmpty()
      .escape()
      .trim(),

      body("cityId", "Country required.")
      .notEmpty()
      .escape()
      .trim(),

      body("postalCode", "Zip code required.")
      .notEmpty()
      .escape()
      .trim(),

      body("address", "Address required.")
      .notEmpty()
      .escape()
      .trim(),
  ],
  
  imguploads.array("logo"),
  CompanyRegistration
);


// router.post(
//   "/registerSubCompany",
//   [
//     body("companyName", "Company name required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//     body("companyEmail", "Email required.")
//       .notEmpty()
//       .escape()
//       .trim()
//       .isEmail(),

//       body("portal", "portal required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("industryId", "Please select industry.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("business", "Please select business.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("employeeCountId", "Employee count required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("countryId", "Country required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("stateId", "State required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("cityId", "Country required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("postalCode", "Zip code required.")
//       .notEmpty()
//       .escape()
//       .trim(),

//       body("address", "Address required.")
//       .notEmpty()
//       .escape()
//       .trim(),
//   ],
  
//   imguploads.array("logo"),
//   SubCompanyRegistration
// );


router.post(
  "/registerSubCompany",
  [
    body("companyName", "Company name required.").notEmpty().escape().trim(),
    body("companyEmail", "Email required.").notEmpty().escape().trim().isEmail(),
    body("portal", "Portal required.").notEmpty().escape().trim(),
    body("industryId", "Please select industry.").notEmpty().escape().trim(),
    body("employeeCountId", "Employee count required.").notEmpty().escape().trim(),
    body("countryId", "Country required.").notEmpty().escape().trim(),
    body("stateId", "State required.").notEmpty().escape().trim(),
    body("cityId", "City required.").notEmpty().escape().trim(),
    body("postalCode", "Postal code required.").notEmpty().escape().trim(),
    body("address", "Address required.").notEmpty().escape().trim(),
    body("business", "Please select business.").notEmpty().escape().trim(), // Handle business data
  ],
  imguploads.array("logo"),
  SubCompanyRegistration
);


router.post(
  "/addBusiness",
  [
    body("businessName", "Business name is required.")
      .notEmpty()
      .escape()
      .trim()
  ],
  
  AddBusiness
);

router.post(
  "/getBusiness",
  GetBusiness
);

router.post(
  "/updateBusiness",
  [
    body("businessId", "Business ID is required.")
      .notEmpty()
      .isInt(),
    body("businessName", "Business name is required.")
      .notEmpty()
      .escape()
      .trim(),
    body("groupName", "Group name is required.")
      .notEmpty()
      .escape()
      .trim()
  ],
  EditBusiness
);

router.post(
  "/activateBusiness",
  [
    body("businessId", "Business ID is required.")
      .notEmpty()
      .isInt()
  ],
  ActivateBusiness
);

router.post(
  "/deactivateBusiness",
  [
    body("businessId", "Business ID is required.")
      .notEmpty()
      .isInt()
  ],
  DeactivateBusiness
);
router.post(
  "/deleteBusiness",
  [
    body("businessId", "Business ID is required.")
      .notEmpty()
      .isInt()
  ],
  DeleteBusiness
);


router.post("/edit-company",imguploads.array("logo"), EditCompanyRegistration);
router.post("/editSubCompany",imguploads.array("logo"), EditSubCompany);
router.post("/deleteSubCompany", DeleteSubCompany);




EditSubCompany

//USER MANAGEMENT
router.get("/get-roles", GetRoles);
router.post("/subcompanywiseRole", GetSubCompanyRoles);

// router.post("/getRoleById",[
//   body("roleId", "role id required").notEmpty().escape()
// ], GetRoleById);


router.post("/create-role",[
  body("roleName", "Role name required.")
    .notEmpty()
    .escape()
    .trim()
    
], CreateRoles);

router.post("/update-role",[
  body("roleIds", "Role id required.")
    .notEmpty()
    .escape()
    .trim(),

  body("roleName", "Role name required.")
    .notEmpty()
    .escape()
    .trim()
    
], UpdateRoles);



router.post("/delete-role", [
  body("roleIds").isArray().withMessage("Role IDs should be an array."),
  body("roleIds.*.roleId", "Role ID is required.").notEmpty(),
  body("roleIds.*.companyId", "Company ID is required.").notEmpty(),
], DeleteRoles);

router.post("/create-user",
[
  body("Name", "Name required.")
    .notEmpty()
    .escape()
    .trim(),

  body("Email", "Email required.")
    .notEmpty()
    .escape()
    .trim()
    .isEmail(),
    
    body("Username", "Username required.")
    .notEmpty()
    .escape()
    .trim(),

    body("Password", "Password required.")
    .notEmpty()
    .escape()
    .trim(),

    body("designationId", "Designation required.")
    .notEmpty()
    .escape(),

    body("roleId", "Role required.")
    .notEmpty()
    .escape()
    .trim()
],
 CreateUser);

router.get("/getUserList", GetUserByCompany);
router.post("/getRoleById", GetRoleById);



router.post("/update-user",[
  body("userId", "User id required")
    .notEmpty()
    .escape()
    .trim(),
  body("Name", "Name required.")
    .notEmpty()
    .escape()
    .trim(),

  body("Email", "Email required.")
    .notEmpty()
    .escape()
    .trim()
    .isEmail(),
    
    body("Username", "Username required.")
    .notEmpty()
    .escape()
    .trim(),

    body("designationId", "Designation required.")
    .notEmpty()
    .escape(),

    body("roleId", "Role required.")
    .notEmpty()
    .escape()
    .trim()
], UpdateUser);


router.post("/get-user",[
  body("userId", "User id required").notEmpty().escape()
], GetUserByUserId);


router.post("/change-password",[
  body("userId", "User id required").notEmpty().escape(),
  body("password", "Password required").notEmpty().escape()
], UpdatePassword);


router.get("/requestForgetPassword", GetRoles);



router.post("/delete-user",[
  body("userId", "User id required").notEmpty().escape()
], DeleteUser);


router.post("/update-password",[
  body("oldPassword", "Old Password required").notEmpty().escape(),
  body("newPassword", "New Password required").notEmpty().escape()
], UpdateSelfPassword);



//EMAIL MANAGEMENT
router.get("/getTemplate", GetTemplates);
router.post("/getTemplateById",[
  body("templateId", "Template id missing").notEmpty().escape()
], GetTemplateById);


router.post("/add-template",[
  body("templateName", "Template name missing").notEmpty().escape(),
  body("html", "HTML body missing").notEmpty().escape(),
], CreateTemplate);


router.post("/update-template",[
  body("templateName", "Template name missing").notEmpty().escape(),
  body("html", "HTML body missing").notEmpty().escape(),
  body("templateId", "Template id missing").notEmpty().escape()
], UpdateTemplate);









// CONTACT MANAGEMENT
router.post("/contact/upload/bulk", upload.single('file'), bulkUpload);



router.post("/contact", ContactDetails);
router.put("/contact/edit", ContactDetailsEdit);
router.post("/GetContactDetails/companyId/", GetContactDetails);
router.get("/GetAllContactDetails", GetAllContactDetails);
router.get("/GetAllContactEmails", GetAllContactEmails);
router.post("/GetContactEmails/contact_Email=?", GetContactEmails);
router.post("/GetContactDetails/created_Date=?", Get_TodayContactDetails);
router.post("/unsubscribe-email", ContactUnSubscribe);
router.post("/get-unsubscribe-email", getUnsubList);




router.post("/userRole", UserRoles);
router.post('/Fileupload',Fileupload);
router.post('/List',List);

router.post("/Campaign", Campaign);
router.put("/Campaign/edit", CampaignDetailsEdit);
router.post("/GetCampaign/UserId=?", GetCampaignUserId);
router.get("/Campaign/types/", GetCampaignTypes);
router.post("/GetCampaign/campaign_Id=?", GetCampaignDataByCampaignId);

router.post("/Segment/", CreateSegment);
router.put("/UpdateSegment", UpdateSegment);
router.get("/getSegment", getSegment);
router.post("/getSegment/segmentId=?", GetSegmentbyId);
router.post("/getSegment/UserId=?", GetSegmentbyUserId);
router.post("/segment/categories", GetSegmentCategoriesbyUserId);
router.get("/segment/criterias", GetSegmentCriterias);


// template.................................................

router.post("/Template", Template);

router.get("/getAllUser", getAllUser);
router.post('/mail',Mail);
router.get("/getAllfieldName", getAllfieldName);
// router.get('/GetContact/:contact_Email', GetContact);

// router.post('/Campaign',Campaign);

// router.get('/getoneuser',getUserName);

// router.get('/getuser',getUser)
router.post("/getScheduler/Id=?", getScheduler);
router.put("/updateScheduler/Id=?", updateScheduler);
router.post("/addSchedule", addScheduler);
router.get("/getAllScheduler", getAllScheduler);
// router.get('/getScheduler/:scheduler_Id',getScheduler);
router.get("/getAllCampaign", getAllCampaign);
router.post("/NewCampaign", NewCampaign);
router.get("/batch/master/all/", GetBatchMaster);
router.post("/GetCampaignBy/UserId=?", GetCampaignByUserId);
router.put("/UpdateCampaign", UpdateCampaign);
router.post("/allCompaniesByUserId/UserId:UserId", getUserCompanyDataByUserId);
router.post("/GetEmailDetails/UserId=?", GetEmailDetails);
router.get("/emailProviders/all", GetEmailProvidersList);
router.get("/GetStateDetails", GetStateDetails);
router.get("/GetCityDetails", GetCityDetails);
router.get("/getAllCountry", getAllCountry);
router.get("/timezones", getAllTimezones);
//////////////
router.post("/addList_of_TimeZone", addList_of_TimeZone);
router.get("/getAll_TimeZone", getTimeZone);
router.post("/addTimeZone", addTimeZone);
router.put("/updateTimeZone", updateTimeZone);
router.put("/updateUserByUserId", updateUserByUserId);
router.put("/ChangePassword/ByUserId", ChangePassword);
router.put("/forgetbyotp", forget);


//template type
router.get("/getTemplateType", getTemplateType);
//doctype
router.post("/addDocument", addDocument);
router.get("/getDocument", getDocument);



router.post('/link-mailbox',linkMailbox);
router.post('/link-gmail',linkGmail);
router.post('/unlink-mailbox',UnlinkMailbox);
router.get('/get-mailbox',getMailboxList);
router.get('/refresh-token/:email',refreshToken);
// router.get('/get-bounce-info',getBounceInfo);
router.post('/linkOtherMail',linkOthermail);
router.get('/getProtocolTypes',getProtocolTypes);



module.exports = router;
