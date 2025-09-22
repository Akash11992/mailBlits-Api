var dbConn = require("./../../config/db.config");


const modelDbConnection =async(res,sp_name,values)=>{
      try
      {
      console.log(values,"values");  
       const sql=`Call ${sp_name}`;
       const result=await dbConn.promise().query(sql,values);
       return result;
      }
      catch(err)
      {
        res.status(500).json({
            success:false,
            error:true,
            message:err.message
        })
      }
}
module.exports=modelDbConnection;
