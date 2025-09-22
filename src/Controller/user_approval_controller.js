const { error } = require('pdf-lib');
const userApprovalModel = require('../Models/user_approval_model');
let VerifyToken = require('../middleware/auth');

const userApprovalController = {
    add_edit: async (req, res) => {
        try {
            const User = VerifyToken(req, res);
            const result = await userApprovalModel.add_edit_user_approval_model(req, res);
            console.log(result, "result");
            if (result == 1) {
                res.status(200).json({
                    success: true,
                    error: false,
                    message: "Approver added successfully"
                })
            }
            else if (result == 0) {
                res.status(200).json({
                    success: true,
                    error: false,
                    message: "Approver edited successfully"
                })
            }
            else {
                res.status(500).json({
                    success: false,
                    error: true,
                    message: "Details check"
                })
            }
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: true,
                message: err.message
            })
        }
    },
    get_details_module_id: async (req, res) => {
        try {
            const User = VerifyToken(req, res);
            const result = await userApprovalModel.get_approver_details_byuser_id(req, res);
            res.status(200).json({
                success: true,
                error: false,
                data: result,
                message: "Approver details"
            })
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: true,
                message: err.message
            })
        }
    },
    getLookup_details: async (req, res) => {
        try {
            const result = await userApprovalModel.getLookup_details(req, res);
            res.status(200).json({
                success: true,
                error: false,
                data: result,
                message: "Lookup details"
            })
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: true,
                message: err.message
            })
        }
    }
}
module.exports = userApprovalController;