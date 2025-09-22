const dbConn = require('../../config/db.config').promise();
const jwt = require("jsonwebtoken");
const {verifyJwt} = require('../Controller/jwtAuth')
const fs = require('fs');
const { log } = require('async');
const dbConnection=require("../middleware/dbConnection");

exports.CompanyRegistration = async (req, res, next) => {

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try{
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  }catch(error){
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  let domain = null;

  let email = req.body.companyEmail
  const atIndex = email.indexOf("@");
  domain = email.substring(atIndex);


  try {
    
    let finalPath = null;

    //image  in payload
   // Check if files were uploaded in the request
   if (req.files && req.files.length > 0 && req.files[0]) {
    finalPath = req.files[0].path;
  } else {
    // If no files were uploaded, set a default path or handle it accordingly
    finalPath = 'src/uploads/product_logo.svg';
  }

    const [rows] = await dbConn.query(
      "call sp_create_company (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        0,
        req.body.companyName,
        req.body.companyEmail,
        req.body.contact || null,
        req.body.portal,
        req.body.industryId,
        req.body.employeeCountId,
        req.body.taxTypId == 'null'?null:req.body.taxTypId,
        req.body.taxInfo == 'null'?null:req.body.taxInfo,
        req.body.countryId,
        req.body.stateId,
        req.body.cityId,
        req.body.postalCode,
        req.body.address,
        userDetails.user_id,
        domain,
        finalPath,
        'c',
        req.body.company_type_id,
        req.body.is_group_company,
        req.body.group_name
      ]);



if(rows[0] && rows[0][0].response==="fail"){
  return res.status(400).json({
    success: false,
    error: true,
    message: "This company details already exist.",
    
  }); 
}else{

      await dbConn.query("call sp_update_company_id_Inreg_users(?,?,?)",
      [
        rows[2][0].company_id,
        userDetails.user_id,
        rows[2][0].group_name
      ]);

      await dbConn.query("call sp_update_logourl_Incompanyregistration(?,?)",
      [        rows[2][0].company_id,
        finalPath
      ]);

      await dbConn.query("call sp_update_role_id_Inreg_users(?,?)",
      [         rows[2][0].company_id,
      rows[1][0].role_id,
        
      ]);

      let companyLogo = null;

      if(rows[2]){
        if(rows[2].length >0){

          let path = rows[2][0].logo_url;

          if (path) {
            path = path.replace(/\\/g, "/");
            companyLogo = `${process.env.PROTOCOL}://${req.get('host')}/${path}`
          }
        }
      }

      const [row] = await dbConn.execute(
        `SELECT  tru.user_id AS id, tru.password AS pas, tru.email AS email, 
        tru.full_name AS name, tru.designation AS designation, 
        tru.role_id AS roleId,tru.company_id AS companyId,tru.is_individual,cr.logo_url
        FROM tbl_users tru LEFT JOIN tbl_company_registration cr ON tru.company_id=cr.company_id
        WHERE tru.email=? AND tru.is_active=1`,
        [userDetails.email]
      );

    const theToken = jwt.sign({user_id:row[0].id,email:row[0].email,roleId:row[0].roleId,companyId:row[0].companyId, company_type:rows[2][0].company_type,
      is_group_company:rows[2][0].is_group_company===1?true:false,group_name:rows[2][0].group_name},process.env.SECRET_KEY,{ expiresIn: '10h' });


      return res.status(201).json({
        success: true,
        error: false,
        message: "The company details has been successfully inserted.",
        data: {
          company_id:rows[2][0].company_id,
          roleId:rows[1][0].role_id,
          companyLogo:companyLogo,
          company_type:rows[2][0].company_type,
          is_group_company:rows[2][0].is_group_company===1?true:false,
          group_name:rows[2][0].group_name,
          token:theToken
        }
      });
    }

  }
  catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error while inserting company record",
      data: err.message,
    });
  }
};



exports.SubCompanyRegistration = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  let domain = null;
  let email = req.body.companyEmail;
  const atIndex = email.indexOf("@");
  domain = email.substring(atIndex);

  const payload = req.body;
  console.log(payload);

  try {
    let finalPath = null;

    if (req.files && req.files.length > 0 && req.files[0]) {
      finalPath = req.files[0].path;
    } else {
      finalPath = 'src/uploads/product_logo.svg';
    }

    const businessData = req.body.business || [];
    let dataArray = [];
    
    try {
      dataArray = JSON.parse(businessData);
    } catch (err) {
      console.error("Error parsing business data", err);
    }

    // Call the stored procedure
    const [rows] = await dbConn.query(
      "CALL sp_createSubCompany(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        req.body.companyName,
        req.body.companyEmail,
        req.body.contact || null,
        req.body.portal,
        req.body.industryId,
        req.body.employeeCountId,
        req.body.taxTypId === 'null' ? null : req.body.taxTypId,
        req.body.taxInfo === 'null' ? null : req.body.taxInfo,
        req.body.countryId,
        req.body.stateId,
        req.body.cityId,
        req.body.postalCode,
        req.body.address,
        userDetails.user_id,
        domain,
        finalPath,
        'c',
        req.body.company_type_id,
        '0',
        userDetails.group_name
      ]
    );

    const companyData = rows[0][0];

    if (companyData.response === "fail") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "This company already exists.",
      });
    }

    const companyId = companyData.company_id;
    // console.log("Company ID:", companyId);

    for (const element of dataArray) {
      try {
        await dbConn.query(
          "CALL sp_addBusinessCompanyMapping(?,?,?,?)",
          [companyId, element, userDetails.group_name, userDetails.user_id]
        );
      } catch (err) {
        console.error("Error executing stored procedure:", err);
      }
    }

    return res.status(201).json({
      success: true,
      error: false,
      message: "The company details have been successfully inserted.",
      data: {
        company_id: companyId,
      },
    });

  } catch (err) {
    console.error("Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Error while inserting company record",
      data: err.message,
    });
  }
};



exports.EditCompanyRegistration = async (req, res, next) => {

  let token = null;
  let userDetails = null;

  if(!req.body.companyId){
    return res.status(401).json({
      success: true,
      message: "Company Id missing",
    });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  const companyId =  req.body.companyId;

  token = req.headers.authorization.split(" ")[1];

  try{
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  }catch(error){
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  let domain = null;

  let email = req.body.companyEmail
  const atIndex = email.indexOf("@");
  domain = email.substring(atIndex);

  try {

    const [comrows] = await dbConn.execute(

      'SELECT logo_url from tbl_company_registration WHERE company_id=?',
      [
        companyId
      ]);
    if(comrows.length == 0){
      return res.status(400).json({
        success: true,
        message: "Invalid request !",
        data: comrows,
      });
    }
    const logoPath = comrows[0].logo_url;

    let finalPath = null;

      if(logoPath){
        const path = logoPath;
        fs.unlink(path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
          console.log('File deleted successfully');
        });
      }

    if(req.files && req.files[0] && req.files[0]?.path){
       finalPath = req.files[0]?.path;
 
     }else{
       finalPath=logoPath
     }

     const [rowsAudit]=await dbConn.execute(`INSERT INTO mailblitzlive_logs.tbl_company_registration_logs SELECT * FROM mailblitzlive.tbl_company_registration WHERE company_id = ${companyId}; `)
    
    const [rows] = await dbConnection(res,"USP_UPDATE_COMPANY_REGISTRATION_DETAILS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        req.body.companyName,
        req.body.companyEmail,
        req.body.contact,
        req.body.portal,
        req.body.industryId,
        req.body.employeeCountId,
        req.body.taxTypId == 'null'?null:req.body.taxTypId,
        req.body.taxInfo == 'null'?null:req.body.taxInfo,
        req.body.countryId,
        req.body.stateId,
        req.body.cityId,
        req.body.postalCode,
        req.body.address,
        domain,
        finalPath,
        'u',
        userDetails.user_id,
        req.body.company_type_id,
        companyId,
      ]);  

const [rows1] = await dbConn.execute(

        'SELECT logo_url from tbl_company_registration WHERE company_id=?',
        [
          companyId,
        ]);
        let filepath = rows1[0].logo_url;

        if (filepath) {
          filepath = filepath.replace(/\\/g, "/");
        }
    if (rows.affectedRows === 1) {
      return res.status(201).json({
        success: true,
        message: "The company details has been successfully updated.",
        data: rows[0],
        logoUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${filepath}`,
      });
    }else{
      return res.status(400).json({
        success: true,
        message: "Invalid request",
        data: rows,
      });
    }
  }
  catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error while updating company record",
      data: err.message,
    });
  }
};


exports.EditSubCompany = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.body.companyId) {
    return res.status(401).json({
      success: true,
      message: "Company Id missing",
    });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  const companyId = req.body.companyId;

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  let domain = null;
  let email = req.body.companyEmail;
  const atIndex = email.indexOf("@");
  domain = email.substring(atIndex);

  try {
    const [comrows] = await dbConn.execute(
      'SELECT logo_url from tbl_company_registration WHERE company_id=?',
      [companyId]
    );

    if (comrows.length === 0) {
      return res.status(400).json({
        success: true,
        message: "Invalid request!",
        data: comrows,
      });
    }

    const logoPath = comrows[0].logo_url;

    if (logoPath) {
      fs.unlink(logoPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return;
        }
        console.log('File deleted successfully');
      });
    }

    let finalPath = req.files && req.files[0] && req.files[0].path ? req.files[0].path : logoPath;

    const [result] = await dbConn.execute(
      'CALL sp_editSubCompany(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        companyId,
        req.body.companyName,
        req.body.companyEmail,
        req.body.contact,
        req.body.portal,
        req.body.industryId,
        req.body.employeeCountId,
        req.body.taxTypId === 'null' ? null : req.body.taxTypId,
        req.body.taxInfo === 'null' ? null : req.body.taxInfo,
        req.body.countryId,
        req.body.stateId,
        req.body.cityId,
        req.body.postalCode,
        req.body.address,
        domain,
        finalPath,
        req.body.companyTypeId,
        userDetails.is_group_company,
        userDetails.group_name,
        userDetails.user_id
      ]
    );

    if (result[0].response === 'success') {
      return res.status(201).json({
        success: true,
        message: "The company details have been successfully updated.",
        data: result,
        logoUrl: `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${finalPath.replace(/\\/g, "/")}`,
      });
    } else {
      return res.status(400).json({
        success: true,
        message: "Invalid request",
        data: result,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error while updating company record",
      data: err.message,
    });
  }
};


exports.DeleteSubCompany = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.body.companyId) {
    return res.status(401).json({
      success: true,
      message: "Company Id missing",
    });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  const companyId = req.body.companyId;

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  try {
    const [result] = await dbConn.execute(
      'CALL sp_deleteSubCompany(?, ?, ?, ?)',
      [
        companyId,
        'd', 
        userDetails.user_id, 
      ]
    );

    if (result[0].response === 'success') {
      return res.status(200).json({
        success: true,
        message: "The company has been successfully deleted.",
        data: result,
      });
    } else {
      return res.status(400).json({
        success: true,
        message: "Invalid request",
        data: result,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error while deleting company record",
      data: err.message,
    });
  }
};







exports.GetCompanyDetailsById = async (req, res, next) => {

  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: true,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try{
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  }catch(error){
    return res.status(401).json({
      success: true,
      message: "Invalid token",
    });
  }

  try {

    const [rows] = await dbConnection(res,"USP_GET_COMPANY_DETAILS_BY_ID(?)",[req.body.companyId]);
    console.log(rows.length,"asasa");
    if (rows.length === 2) {

      return res.status(201).json({
        success: true,
        message: "The company details has been successfully inserted.",
        data: rows[0][0],
      });
    }else{
      return res.status(404).json({
        success: true,
        message: "No company Found!",
      });
    }

  }
  catch (err) {
    return res.status(500).json({
      success: true,
      message: "Error while inserting company record",
      data: err.message,
    });
  }
};


exports.GetCompanyDetailsByGroupName = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false, 
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];

  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false, 
      message: "Invalid token",
    });
  }

  try {
    const userDetails = verifyJwt(req);
   
    let group_name=null;
    if(userDetails.is_group_company){
      group_name=userDetails.group_name;
    }
    console.log("group_name",group_name,userDetails.is_group_company);
    
    const [roleRow] = await dbConn.query("call sp_getCompanyList(?,?)",[group_name,userDetails.companyId]);
    if (roleRow.length == 0) {
      return res.status(400).send({
        message: "No company Found!",
      });
    }
    
      return res.status(200).send({
        message: "Companies Fetched!",
        data: roleRow[0],
      });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
};



exports.GetIndustryTypes = async (req, res, next) => {

  try {
    const [row] = await dbConnection(res,"USP_GET_INDUSTRY_DETAILS()",[])

      return res.status(201).json({
        message: "Industry Types fetched",
        success: true,
        data: row[0],
      });
  }
  catch (err) {
    next(err);
  }
};



exports.GetEmployeeCount = async (req, res, next) => {

  try {
    const [row] = await dbConnection(res,"USP_GET_EMPLOYEE_COUNT()",[]);

      return res.status(201).json({
        message: "Employee Count Fetched",
        success: true,
        data: row[0],
      });
  }
  catch (err) {
    next(err);
  }
};
exports.GetCompanyType = async (req, res, next) => {

  try {
    const [row] = await dbConnection(res,"USP_GET_COMPANY_DETAILS()",[]);

      return res.status(201).json({
        message: "Company Type Fetched.",
        success: true,
        data: row[0],
      });
  }
  catch (err) {
    next(err);
  }
};


exports.GetTaxTypes = async (req, res, next) => {

  try {
    const { p_country_id } = req.body || null;
    const [row] = await dbConn.query(
      "call sp_get_tax_type(?)", 
      [p_country_id]
    );

      return res.status(201).json({
        message: "Tax types Fetched",
        success: true,
        data: row,
      });
  }
  catch (err) {
    next(err);
  }
};


exports.AddBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const { businessName } = req.body;
  if (!businessName ) {
    return res.status(400).json({
      success: false,
      message: "Business name and group name are required",
    });
  }
  console.log(userDetails.user_id);
  
  try {
    const data = await dbConn.query(
      "CALL sp_insertBusiness(?, ?, ?)",
      [userDetails.user_id, businessName, userDetails.group_name]
    );

    return res.status(200).json({
      success: true,
      message: "Business added successfully",
    });
  } catch (error) {
    console.log(error.sqlState,error.sqlMessage);
    
    if (error.sqlState === '45000' && error.sqlMessage === 'Business already exists') {
      return res.status(400).json({
          success: false,
          message: error.message,
      });
  }
    console.error("Error inserting business:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error adding business",
      error: error.message,
    });
  }
};

exports.GetBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
    console.log(userDetails);
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }


  try {
    const [data] = await dbConn.query("CALL sp_getBusiness(? , ? , ?)", [userDetails.user_id,userDetails.group_name,userDetails.companyId]);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No business data found",
      });
    }
    
    return res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error fetching business data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching business data",
      error: error.message,
    });
  }
};


exports.EditBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const { businessId, businessName} = req.body;
  if (!businessId || !businessName) {
    return res.status(400).json({
      success: false,
      message: "Business ID, name, and group name are required",
    });
  }

  try {
    const data = await dbConn.query(
      "CALL sp_updateBusiness(?, ?, ?, ?)",
      [businessId, businessName, userDetails.group_name, userDetails.user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
    });
  } catch (error) {
    console.error("Error updating business:", error);
    console.log(error.sqlState,error.sqlMessage);
    
    if (error.sqlState === '45000' && error.sqlMessage === 'Business already exists') {
      return res.status(400).json({
          success: false,
          message: error.message,
      });
  }
    return res.status(500).json({
      success: false,
      message: "Error updating business",
      error: error.message,
    });
  }
};


exports.ActivateBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({
      success: false,
      message: "Business ID is required",
    });
  }

  try {
    const data = await dbConn.query(
      "CALL sp_activateBusiness(?, ?)",
      [businessId, userDetails.user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Business activated successfully",
    });
  } catch (error) {
    console.error("Error activating business:", error);
    return res.status(500).json({
      success: false,
      message: "Error activating business",
      error: error.message,
    });
  }
};



exports.DeactivateBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({
      success: false,
      message: "Business ID is required",
    });
  }

  try {
    const data = await dbConn.query(
      "CALL sp_deactivateBusiness(?, ?)",
      [businessId, userDetails.user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Business deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating business:", error);
    return res.status(500).json({
      success: false,
      message: "Error deactivating business",
      error: error.message,
    });
  }
};

exports.DeleteBusiness = async (req, res, next) => {
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "Token not present",
    });
  }

  token = req.headers.authorization.split(" ")[1];
  try {
    userDetails = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({
      success: false,
      message: "Business ID is required",
    });
  }

  try {
    const data = await dbConn.query(
      "CALL sp_deleteBusiness(?, ?)",
      [businessId, userDetails.user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting business:", error);
    return res.status(500).json({
      success: false,
      message: "Error WHILE deleting business",
      error: error.message,
    });
  }
};

