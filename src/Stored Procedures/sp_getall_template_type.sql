CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_template_type`()
BEGIN
select template_type_id,template_type from tbl_template_type where is_active=1;
END