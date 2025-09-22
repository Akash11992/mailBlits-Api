const dbConn = require("../../config/db.config").promise();
const { verifyJwt,checkTokenExpired } = require("../Controller/jwtAuth");

exports.getAuditReportDropdown = async (req, res, next) => {
    try {
      const userDetails = verifyJwt(req);

      const ReportMenus = await dbConn.query(
        "CALL sp_get_AuditReportDropdown()");
      return res.status(200).send({
        message: "Users Audit Report Menu Fetched successfully!",
        data: ReportMenus[0][0]
      });
  
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).send({
        message: err.message,
      });
    }
  };

// exports.getUsersAuditReport = async (req, res, next) => {
//     try {
//         const userDetails = verifyJwt(req);
//         console.log(userDetails.user_id,"User Details");
        
//         const moduleId = req.body.module_id;
//         const fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null; 
//         const toDate = req.body.toDate ? new Date(req.body.toDate) : null; 

//         const UsersReport = await dbConn.query(
//             "CALL sp_get_ModuleWise_AuditReports(?,?,?,?)", [moduleId , userDetails.user_id,fromDate, toDate]
//         );

//         // console.log(UsersReport[0][0], "userreport");

//         return res.status(200).send({
//             message: "Users Audit Report Fetched successfully!",
//             data: UsersReport[0][0] 
//         });

//     } catch (err) {
//         console.log("Error:", err);
//         return res.status(500).send({
//             message: err.message,
//         });
//     }
// };

// exports.getUsersAuditReport = async (req, res, next) => {
//   try {
//       const userDetails = verifyJwt(req);
//       console.log(userDetails.user_id, "User Details");
      
//       const moduleId = req.body.module_id;
//       const fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null; 
//       const toDate = req.body.toDate ? new Date(req.body.toDate) : null; 

//       // Call the stored procedure
//       const UsersReport = await dbConn.query(
//           "CALL sp_get_ModuleWise_AuditReports(?,?,?,?)", 
//           [moduleId, userDetails.user_id, fromDate, toDate]
//       );

//       let transformedReport = [];

      
      
//       if (moduleId == 4) {
//       console.log(moduleId,"moduleIdinif");

//           UsersReport[0][0].forEach(row => {
//               const criteriaArray = JSON.parse(row.Criteria);

//               criteriaArray.forEach(criteria => {
              
//                   transformedReport.push({
//                       Segment_name: row.Segment_name,
//                       Company: row.Company,
//                       contains: criteria.contains, 
//                       segment_type: criteria.segment_type,
//                       segmentvalue: criteria.segmentvalue,
//                       Is_Active: row.Is_Active,
//                       Action: row.Action,
//                       Created_by: row.Created_by,
//                       created_at: row.created_at,
                      
//                   });
//                   console.log(transformedReport,"trf");
                  
//               });
//           });
//       } else {
//           console.log("in else......");
          
//           transformedReport = UsersReport[0][0];
//       }
//       // console.log(transformedReport,"transformedReport");
      
//       return res.status(200).send({
//           message: "Users Audit Report Fetched successfully!",
//           data: transformedReport // Send the transformed or original data
//       });

//   } catch (err) {
//       console.log("Error:", err);
//       return res.status(500).send({
//           message: err.message,
//       });
//   }
// };

exports.getUsersAuditReport = async (req, res, next) => {
  try {
      const userDetails = verifyJwt(req);
      
      
      const moduleId = req.body.module_id;
      const fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null; 
      const toDate = req.body.toDate ? new Date(req.body.toDate) : null; 

      const UsersReport = await dbConn.query(
           "CALL sp_get_ModuleWise_AuditReports(?,?,?,?,?,?)", 
          [moduleId, userDetails.user_id, userDetails.companyId, userDetails.role_name, fromDate, toDate]
      );

      let transformedReport = [];

      if (moduleId == 4) {
        
          UsersReport[0][0].forEach(row => {
              const criteriaArray = JSON.parse(row.Criteria);

              criteriaArray.forEach(criteria => {
                  // Map criteria.contains to the corresponding option_value
                  let optionValue = "";
                  switch (criteria.contains) {
                      case "=":
                          optionValue = "is";
                          break;
                      case "!=":
                          optionValue = "is not";
                          break;
                      case "=":
                          optionValue = "contains";
                          break;
                      case "!=":
                          optionValue = "doesn't contain";
                          break;
                      default:
                          optionValue = criteria.contains; 
                          break;
                  }

                  transformedReport.push({
                      Segment_name: row.Segment_name,
                      Company: row.Company,
                      contains:optionValue,
                      segment_type: criteria.segment_type,
                      segmentvalue: criteria.segmentvalue,
                      Is_Active: row.Is_Active,
                      Action: row.Action,
                      Created_by: row.Created_by,
                      created_at: row.created_at,
                  });
                  console.log(transformedReport, "trf");
              });
          });
      } else {
          

          transformedReport = UsersReport[0][0];
      }

      return res.status(200).send({
          message: "Users Audit Report Fetched successfully!",
          data: transformedReport // Send the transformed or original data
      });

  } catch (err) {
      console.log("Error:", err);
      return res.status(500).send({
          message: err.message,
      });
  }
};



  