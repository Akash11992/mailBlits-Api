const bigInt = require("big-integer");
var dbConn = require("./../../config/db.config");

//object create
var UserPermission = function (permission) {
  this.form_id = permission.form_id;
  this.role_id = permission.role_id;
  this.company_id = permission.company_id;
  this.is_view = permission.is_view;
  this.is_create = permission.is_create;
  this.is_update = permission.is_update;
  this.is_delete = permission.is_delete;
  this.is_import = permission.is_import;
  this.is_export = permission.is_export;
  this.is_field = permission.is_field;
  this.is_ai = permission.is_ai;
  this.created_by = permission.created_by;
  this.updated_by = permission.updated_by;
};

UserPermission.create = function (permission, userDetails, result) {
  let completedRequests = 0; // Track completed queries
  let responses = []; // Store responses
  let formIds=permission.form_id;
  let roleIds = permission.role_id;
  console.log(permission.role_id);
  
   // Loop through each form_id
  formIds.forEach((form_id) => {
    // Loop through each role object
    roleIds.forEach((role) => {
  let sql =
    "call  sp_create_role_mapping_with_forms(?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?); ";
  var values = [
    // permission.form_id,
    form_id, // Use the current form_id in the loop
    role.roleId,
    role.companyId,
    permission.is_create,
    permission.is_update,
    permission.is_view,
    permission.is_delete,
    permission.is_import,
    permission.is_export,
    permission.is_ai,
    permission.is_field,
    userDetails.user_id  ];
    // Execute the query for each form_id and role_id
  dbConn.query(sql, values, function (err, res) { // Execute the query for each form_id
    completedRequests++;
    if (err) {
      result(err, null);
    } else {
      // result(null, res);
      responses.push(res[0][0].response); // Collect responses
    }
  
   
  if (completedRequests === formIds.length * roleIds.length) {
    result(null, responses); // Send all responses once done
  }
});
});
  });
};

UserPermission.update = function (
  form_id,
  role_id,
  userDetails,
  permission,
  result
) {
  let sql = "call sp_role_mapping_withforms_update(?,?,?,?,?,?,?,?,?,?,?);";
  var values = [
    form_id,
    role_id,
    userDetails.companyId,
    permission.is_view,
    permission.is_create,
    permission.is_update,
    permission.is_delete,
    permission.is_import,
    permission.is_export,
    permission.is_field,
    userDetails.user_id,
  ];
  dbConn.query(sql, values, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

UserPermission.findById = function (form_ids, role_ids, result) {
  let form_ids_str=form_ids.join(','); // Convert array to comma-separated string
  let role_ids_str = role_ids.map(role => role.roleId).join(','); 
  let company_ids_str = role_ids.map(role => role.companyId).join(',');
  dbConn.query(
    "call  sp_getRoleMappingWithForms(?,?,?);",
    [form_ids_str, role_ids_str, company_ids_str],
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

UserPermission.findCount = function (role_data, result) {
  const company_ids = role_data.map(item => item.company_id).join(',');
  const role_ids = role_data.map(item => item.roleId).join(',')
  dbConn.query(
    "call  sp_getConfigurePermissionsCount(?,?);",
    [company_ids, role_ids],
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

UserPermission.permissionById = function (role_id, company_id, result) {
  dbConn.query(
    "call  sp_getUserPermission(?,?);",
    [role_id, company_id],
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};


UserPermission.getforms = function (module_ids,result) {
   // Convert array to comma-separated string
  //  console.log("before",module_ids);
   const module_ids_str = module_ids.join(',');
  //  console.log("after",module_ids_str);
  dbConn.query(
    "call  sp_get_forms_bymoduleid(?);",[module_ids_str],
  
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

UserPermission.getmodules = function (result) {
  dbConn.query(
    "call  sp_get_module();",
  
    function (err, res) {
      if (err) {
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};
module.exports = UserPermission;
