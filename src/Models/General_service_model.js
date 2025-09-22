const dbConnection=require("../middleware/dbConnection");


const GeneralServiceModel={
     getAllDestinationList :async (req,res)=>{
         try{
            const result=await dbConnection(res,"USP_GET_ALL_DESTINATIONS_LIST()",[]);
            return result[0];
         }
         catch(err)
         {
            throw err;
         }
     },
     getCountryList :async (req,res)=>{
        try
        {
           const result=await dbConnection(res,"USP_GET_COUNTRY_LIST()",[]);
           return result[0];
        }
        catch(err)
        {
            throw err;
        }
     }

}
module.exports=GeneralServiceModel;