CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_forms`()
BEGIN
SELECT form_id,form_name,is_active FROM tbl_forms;
SELECT count(*) as count FROM tbl_forms;

END