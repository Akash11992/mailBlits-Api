const dbConn = require("../../../config/db.config");

module.exports = async () => {
   try {
    await dbConn.promise().query("delete from `tbl_list_count_tmp_data`");
   } catch (error) {
    console.error("Error in clean_list_temp_data.js", error);
   }
}