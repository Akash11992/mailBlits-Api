'use strict';
const dbConn = require('../../config/db.config').promise();
//Employee object create
let emailSenders = function (user) {
  this.es_id = user.es_id;
  this.es_company_id = user.es_company_id;
  this.es_user_id = user.es_user_id;
  this.es_name = user.es_name;
  this.es_username = user.es_username;
  this.es_password = user.es_password;
  this.es_email_provider = user.es_email_provider;
  this.es_host = user.es_host;
  this.es_port = user.es_port;
  this.es_tenant_id = user.es_tenant_id
  this.es_client_id = user.es_client_id,
  this.es_ssl_option = user.es_ssl_option,
  this.es_provider_payload = user.es_provider_payload
};


// emailSenders.create = async function (data, result) {

//   console.log("===data==========")
//   console.log(data)

//   return await dbConn.execute('INSERT INTO `tbl_email_senders`(es_company_id, es_user_id, es_name, es_username, es_password, es_email_provider, es_host, es_port, es_tenant_id, es_client_id, es_ssl_option, es_provider_payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
//       [data.es_company_id, data.es_user_id, data.es_name, data.es_username, data.es_password, data.es_email_provider, data.es_host, data.es_port, data.es_tenant_id, data.es_client_id, data.es_ssl_option, JSON.stringify(data.es_provider_payload)],
//       function (err, res) {
//         if (err) {
//           console.error("error: ", err);
//         }
//       });
// };


emailSenders.create = async function (data, result) {

  return await dbConn.execute('INSERT INTO `tbl_email_senders`(es_company_id, es_name, es_email_provider, es_provider_payload) VALUES (?,?,?,?)',
      [data.es_company_id, data.es_name, data.es_email_provider, JSON.stringify(data.es_provider_payload)],
      function (err, res) {
        if (err) {
          console.error("error: ", err);
        }
      });
};


emailSenders.findById = async function (id) {
    return await dbConn.execute('SELECT rc_id AS id, rc_name AS name, rc_mail as mail, rc_url as url, rc_remark as remark, rc_user_id as userId, rc_phone_num as phoneNum, rc_total_employees as numEmployees, rc_timezone as timezone, rc_country as country, rc_created_by as createdBy FROM `sqm_reg_companies` WHERE rc_id=? AND rc_is_active=1 AND rc_is_deleted=0',
        [id]);
  };

  emailSenders.findByUserID = async function (id) {
    return await dbConn.execute('SELECT rc_id AS id, rc_name AS name, rc_mail as mail, rc_url as url, rc_remark as remark, rc_user_id as userId, rc_phone_num as phoneNum, rc_total_employees as numEmployees, rc_timezone as timezone, rc_country as country, rc_created_by as createdBy FROM `sqm_reg_companies` WHERE rc_user_id=? AND rc_is_active=1 AND rc_is_deleted=0',
        [id]);
  };



  emailSenders.findAll = function (result) {
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


emailSenders.update = function (company_Id, user, result) {
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

emailSenders.getNumEmployees = async function() {
  return await dbConn.execute('SELECT enm_id AS id, enm_name AS name, CONCAT(enm_lo, "-" ,enm_high) as emplRange FROM `tbl_employees_num_master` WHERE enm_is_active=1 AND enm_is_deleted=0');
};


module.exports = emailSenders;
