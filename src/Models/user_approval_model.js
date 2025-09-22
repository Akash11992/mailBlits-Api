const { zero } = require("big-integer");
var dbConn = require("./../../config/db.config");


const add_edit_user_approval_model = async (req, res) => {
    try {
        const module_json = JSON.stringify(req.body.module_json);
        const approver_json = JSON.stringify(req.body.approver_json);
        var my_query = `call USP_INSERT_EDIT_APPROVER_DETAILS(?,?,?,?,?,?,?)`;
        const result = await dbConn.promise().execute(my_query,
            [
                req.body.id,
                req.body.user_id,
                req.body.company_id,
                req.body.level_approval,
                module_json,
                approver_json,
                req.body.created_by
            ]);
        return result[0][0][0].result;
    }
    catch (err) {
        throw err;
    }
}
const get_approver_details_byuser_id = async (req, res) => {
    try {

        var my_query = `call USP_GET_APPROVER_LIST_BY_USER_ID_MODULE_ID(?,?)`;
        const result = await dbConn.promise().execute(my_query,
            [
                req.body.user_id,
                req.body.module_id
            ]);
        return result[0][0];
    }
    catch (err) {
        throw err;
    }
}
const getLookup_details = async (req, res) => {
    try {
        var my_query = `call USP_LOOKUP_DETAILS(?)`;
        const result = await dbConn.promise().execute(my_query,
            [
                req.body.lookup_key
            ]);
        return result[0][0];
    }
    catch (err) {
        throw err;
    }
}
module.exports = {
    add_edit_user_approval_model,
    get_approver_details_byuser_id,
    getLookup_details
}