'use strict';
const dbConn = require('../../config/db.config').promise();
//Employee object create
let company = function (user) {
  this.companyName = user.companyName;
  this.companyEmail = user.companyEmail;
  this.companyUrl = user.companyUrl;
  this.remark = user.remark;
  this.phoneNumber = user.phoneNumber;
  this.numEmployee = user.numEmployee;
  this.companyLocation = user.companyLocation;
  this.timezone = user.timezone;
  this.userId = user.userId;
  this.countryId = user.countryId
  this.createdBy = user.createdBy
};


company.create = async function (data, result) {
  return await dbConn.execute('INSERT INTO `sqm_reg_companies`(rc_name, rc_mail, rc_url, rc_remark, rc_user_id, rc_phone_num, rc_address, rc_total_employees, rc_timezone, rc_country, rc_created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [data.companyName, data.companyEmail, data.companyUrl, data.remark, data.userId, data.phoneNumber, data.companyLocation, data.numEmployee, data.timezone, data.countryId, data.createdBy],
      function (err, res) {
        if (err) {
          console.error("error: ", err);
        }
      });
};


company.findById = async function (id) {
    return await dbConn.execute('SELECT rc_id AS id, rc_name AS name, rc_mail as mail, rc_url as url, rc_remark as remark, rc_user_id as userId, rc_phone_num as phoneNum, rc_total_employees as numEmployees, rc_timezone as timezone, rc_country as country, rc_created_by as createdBy FROM `sqm_reg_companies` WHERE rc_id=? AND rc_is_active=1 AND rc_is_deleted=0',
        [id]);
  };

company.findByUserID = async function (id) {
    return await dbConn.execute('SELECT rc_id AS id, rc_name AS name, rc_mail as mail, rc_url as url, rc_remark as remark, rc_user_id as userId, rc_phone_num as phoneNum, rc_total_employees as numEmployees, rc_timezone as timezone, rc_country as country, rc_created_by as createdBy FROM `sqm_reg_companies` WHERE rc_user_id=? AND rc_is_active=1 AND rc_is_deleted=0',
        [id]);
  };



company.findAll = function (result) {
  dbConn.query("SELECT * FROM `sqm_reg_companies`", function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    }
    else {
      console.log('user : ', res);
      result(null, res);
    }
  });
};


company.update = function (company_Id, user, result) {
  dbConn.query("call update_company_registration (?,?,?,?,?,?,?,?,?)",
    [user.companyName, user.companyEmail, user.companyURL, user.remark, user.Phone_Number, user.Number_of_Employe, user.companyLocation,  user.UserId,
    user.company_Id], function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    });
};

company.getNumEmployees = async function() {
  return await dbConn.execute('SELECT enm_id AS id, enm_name AS name, CONCAT(enm_lo, "-" ,enm_high) as emplRange FROM `tbl_employees_num_master` WHERE enm_is_active=1 AND enm_is_deleted=0');
};

//   Employee.delete = function (id, result) {
//     dbConn.query("DELETE FROM tbl_post_jobs WHERE id = ?", [id], function (err, res) {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//       }
//       else {
//         result(null, res);
//       }
//     });
//   };
module.exports = company;
