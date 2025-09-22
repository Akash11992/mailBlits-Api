const { log } = require("async");
const UserPermission = require("../Models/UserPermission.model");
const { verifyJwt } = require("../Controller/jwtAuth");

exports.findById = function (req, res) {
  try {
    const userDetails = verifyJwt(req);
    // console.log(userDetails);
    UserPermission.findById(
      req.body.form_ids,
      req.body.role_ids,
      // req.body.company_id===null?userDetails.companyId:req.body.company_id,
      function (err, permission) {
        // console.log(" permission[0]", permission);
        if (err) {
          console.log(err);
          return res.status(400).json({
            status: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
        // Preprocess the permission data to replace null with 0
        permission[0]?.forEach(item => {
          Object.keys(item).forEach(key => {
            if (item[key] === null) {
              item[key] = 0;
            }
          });
        });
        // console.log(permission);
        
        if (permission[0][0]?.response === "fail")
          return res.json({
            success: false,
            error: true,
            message: "User Permission does not exist with this company!",
            count: permission[1][0]?.count,
          });
        else
          return res.json({
            data: permission[0],
            success: true,
            error: false,
            message: "User Permissions fetched successfully!",
            count: permission[1][0]?.count,
          });
      }
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

exports.findCount = function (req, res) {
  try {
    const userDetails = verifyJwt(req);
    if (!req.body.role_data) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Please provide role_id",
      });
    }
    UserPermission.findCount(
      req.body.role_data,
      function (err, permission) {
        if (err) {
          console.log(err);
          return res.status(400).json({
            status: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
console.log(permission)
        if (permission[0][0]?.response === "fail")
          return res.json({
            success: false,
            error: true,
            message: "Permission does not exist with this company!",
            count: permission[0],
          });
        else {
          // console.log(permission[0]);
          return res.json({
            success: true,
            error: false,
            message: "Permissions Count fetched successfully!",
            count: permission[0],
          });
        }
      }
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

exports.permissionById = function (req, res) {
  try {
    const userDetails = verifyJwt(req);
    UserPermission.permissionById(
      req.body.role_id,
      userDetails.companyId,

      function (err, permission) {
        // console.log(permission);
        
        if (err) {
          console.log(err);
          return res.status(400).json({
            status: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
        if (permission[0][0]?.response === "fail") {
          return res.json({
            success: false,
            error: true,
            message: "Permission does not exist with this company!",
            count: permission[1][0].count,
          });
        } else {
          // Sample data
          const data = permission[0];

          // Object to store the form names and permissions
          const result = {};

          // Iterate over the data and populate the result object
          data.forEach((record) => {
            const formName = record.form_name.replace(/ /g, "_");
            result[formName] = {
              view: record.is_view === 1,
              create: record.is_create === 1,
              update: record.is_update === 1,
              delete: record.is_delete === 1,
              import: record.is_import === 1,
              export: record.is_export === 1,
              ai: record.is_ai === 1,
              field: record.is_field === 1,
            };
          });

          // Convert the result object to JSON
          const jsonResult = JSON.stringify(result, null, 4);

          const dataString = jsonResult;
          const jsonData = JSON.parse(dataString);

          return res.json({
            data: jsonData,
            success: true,
            error: false,
            message: "Permissions fetched successfully!",
            count: permission[1][0].count,
          });
        }
      }
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    const code = err?.code || 500;
    res.status(code).json({ success: false, error: true, message: err.message });
  }
};

exports.create = function (req, res) {
  try {
    const userDetails = verifyJwt(req);
    const new_permission = new UserPermission(req.body);
// console.log("new",new_permission);

    //handles null error
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: true, message: "Please provide all required field" });
    } // Check if all required fields are provided
    const requiredFields = ["form_id", "role_id"];
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined
    );
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send({
          error: true,
          message: `Please provide ${missingFields.join(", ")}`,
        });
    } else {
      UserPermission.create(
        new_permission,
        userDetails,
        function (err, permission) {
          if (err) {
            // console.log(err);
            return res.status(400).json({
              status: false,
              error: true,
              message: "Something went wrong. Please try again.",
            });
          } else if (permission[0][0].response === "fail")
            return res.status(400).send({
              success: false,
              error: true,
              message:
                "This permission details already exist with this company id!",
            });
          else if (permission[0][0].response === "updated")
            return res.status(200).send({
              success: true,
              error: false,
              message: "This permission details updated successfully!",
            });
          else {
            // console.log(permission[0][0].response);
            return res.json({
              success: true,
              error: false,
              message: "This permission details added successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const userDetails = verifyJwt(req);
    const User_Permission = new UserPermission(req.body);
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .send({ error: true, message: "Please provide all required field" });
    } // Check if all required fields are provided
    const requiredFields = ["form_id", "role_id"];
    const missingFields = requiredFields.filter(
      (field) => req.body[field] === undefined
    );
    if (missingFields.length > 0) {
      return res
        .status(400)
        .send({
          error: true,
          message: `Please provide ${missingFields.join(", ")}`,
        });
    } else {
      UserPermission.update(
        req.body.form_id,
        req.body.role_id,
        userDetails,
        User_Permission,
        function (err, permission) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              status: false,
              error: true,
              message: "Something went wrong. Please try again.",
            });
          } else {
            return res.json({
              error: false,
              success: true,
              message: "user permission details updated successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};



exports.getforms = function (req, res) {
  try {
   
    UserPermission.getforms(req.body.module_ids,
      function (err, forms) {
        
        if (err) {
          console.log(err);
          return res.status(400).json({
            status: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
        
        else {
          // console.log(permission);
          return res.json({
            success: true,
            error: false,
            message: "Forms fetched successfully!",
           data:forms[0],
            // count: forms[1][0].count,
          });
        }
      }
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

exports.getmodules = function (req, res) {
  try {
   
    UserPermission.getmodules(
      function (err, modules) {
        if (err) {
          console.log(err);
          return res.status(400).json({
            status: false,
            error: true,
            message: "Something went wrong. Please try again.",
          });
        }
        
        else {
          // console.log(permission);
          return res.json({
            success: true,
            error: false,
            message: "Modules fetched successfully!",
           data:modules[0],
            count: modules[1][0].count,
          });
        }
      }
    );
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};
