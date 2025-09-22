const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dbConn = require('../../config/db.config').promise();



exports.login = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    // const [row] = await dbConn.execute(
    //   `SELECT  ru_id AS id, ru_password AS pas, ru_email AS email, ru_is_active,
    //   ru_name AS name, ru_username AS username, ru_designation AS designation, 
    //   ru_role_id AS roleId,ru_ref_company_Id AS companyId,tru.is_individual,cr_logo_url
    //   FROM tbl_users tru LEFT JOIN tbl_company_registration cr ON tru.ru_ref_company_Id=cr.cr_id
    //   WHERE ru_email=? AND ru_is_deleted=0`,
    //   [req.body.Email]
    // );


    const [loginrow] = await dbConn.execute("CALL sp_LoginUser(?)",
    [req.body.Email]);

    // console.log(loginrow[0],loginrow[0].length,loginrow[0].length === 0);
    if (loginrow[0].length === 0) {
      
      return res.status(401).send({
        message: "User does not exist!",
        success: false,
      });
    }

    const userObj = loginrow[0];


    if (userObj.length > 0) {

      if(!userObj[0].is_email_verified){
        return res.status(401).send({
          message: "Please verify your account via email !",
          success: false,
        });
      }

// console.log(userObj[0].ru_admin_approval && userObj[0].companyId===null);
      if(!userObj[0].is_admin_approval && userObj[0].companyId===null){
        return res.status(401).send({
          message: "Admin approval is pending for your account !",
          success: false,
        });
      }
    } 

  
    const passMatch = await bcrypt.compare(req.body.Pas, userObj[0].pas);
  
    if (!passMatch) {
      
      return res.status(400).json({
        message: "Incorrect password.",
        success: false,
      });
    }


    const theToken = jwt.sign({user_id:userObj[0].id,email:userObj[0].email,roleId:userObj[0].roleId,role_name:userObj[0].role_name,companyId:userObj[0].companyId,is_group_company:userObj[0].is_group_company===1?true:false,group_name:userObj[0].group_name},process.env.SECRET_KEY,{ expiresIn: '10h' });
    let logoPath = userObj[0].logo_url;

    if (logoPath) {
      logoPath = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${logoPath}`
    }


    return res.json({
      success: true,
      message: "User Login Successfully",
      data: {userId: userObj[0].id, userEmail: userObj[0].email, user: userObj[0].user, username: userObj[0].username,name:userObj[0].name, roleId: userObj[0].roleId,role_name:userObj[0].role_name, designation: userObj[0].designation,companyId:userObj[0].companyId,is_individual: userObj[0].is_individual,logoUrl:logoPath,is_group_company:userObj[0].is_group_company===1?true:false,group_name:userObj[0].group_name, is_ai_enabled: userObj[0].is_ai_enabled},
      token: theToken,
      // Data:req.body,(only use in registration page)
    });
  } catch (err) {
    next(err);
  }
};
