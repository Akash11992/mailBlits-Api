CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_AuditReportDropdown`()
BEGIN
SELECT module_id ,module_name FROM mailblitzuat.tbl_audit_modules_master WHERE is_active =1;
END