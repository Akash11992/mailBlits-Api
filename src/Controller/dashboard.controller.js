
const { verifyJwt } = require("./jwtAuth");

const dbConn = require("../../config/db.config").promise();


const dashboardController = {

 
  getDashboardInfo: async (req, res) => {
    
    try {
        const userDetails = verifyJwt(req);
        
        const allInfo = await dbConn.execute("CALL sp_Get_Dashboard_info(?)",
            [userDetails.companyId]);

        return res.status(200).json({
          allInfo: allInfo[0][0],
          message: "Dashboard data fetched!",
        });

      } catch (error) {
        return res.status(500).json({
          error: error,
          message: "Error occured while fetching data !",
        });
      }

  }

};


module.exports = dashboardController;
