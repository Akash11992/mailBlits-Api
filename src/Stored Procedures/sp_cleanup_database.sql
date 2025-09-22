CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_cleanup_database`()
BEGIN
set sql_safe_updates=0;
delete from tblbouceemaildetails;
delete from tblemailtrackerlogs;
delete from tblemailsentlogs;
delete from tbl_email_scedhuler_document_mapping;
delete from tbl_email_scedhuler_template_mapping;
delete from tbl_email_scheduler_rule_for_campaign;
delete from tbl_attachment_campaign_mapping;
delete from tbl_attachment_template_mapping;
delete from tbl_days_campaign_mapping;
delete from tbl_fromuser_campaign_mapping;
delete from tbl_forget_password;

delete from tbl_document;
delete from tbl_letter_heads;
delete from tbl_doc_footer;
delete from tbl_doc_header;
delete from tbl_schedule_campaign_mapping;
delete from tbl_unsubscribe;
delete from tbl_campaign;
delete from tbl_role_mapping_with_forms;
delete from tbl_segments;
delete from tbl_template;
delete from tbl_users;
delete from tblbusiness;
delete from  tblbusinesscompanymapping;
delete from tbl_role_master;
delete from tbl_mailbox;
delete from tbl_email_senders;
delete from tbl_contact_list_mapping;
delete from tbl_list;
delete from tbl_contact;
delete from tbl_role_master;
delete from tbl_role_mapping_with_forms;
delete from tbl_company_registration;
delete from tbl_user_verification;
delete from tbl_admin_verification;
delete from tbl_request_response_log;
delete from tbl_error_log;
END