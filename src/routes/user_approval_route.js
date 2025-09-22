const express=require('express');
const app=express.Router();
const userApprovalController =require('../Controller/user_approval_controller');
const {userApprovalValidator,validateRequest}=require('../Validators/user_approval_validator');

app.use('/add-edit_approval',userApprovalValidator,validateRequest,userApprovalController.add_edit);
app.use('/get_module_details_by_user_id',userApprovalController.get_details_module_id);
app.use('/getLookup_details',userApprovalController.getLookup_details);


module.exports=app;