CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getRole_bysubcompanyID`(p_company_id int)
BEGIN
SELECT role_id AS roleId ,role_name as roleName from tbl_role_master
 WHERE is_active=1  
AND 
company_id = p_company_id;
END