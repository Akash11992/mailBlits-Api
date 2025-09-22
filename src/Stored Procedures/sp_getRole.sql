CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getRole`(p_group_name varchar(100),p_company_id int)
BEGIN
SELECT role_id AS roleId ,role_name as roleName,company_id,group_name from tbl_role_master
 WHERE is_active=1  
AND (
(p_group_name IS NOT NULL AND group_name = p_group_name) OR 
(p_group_name IS NULL AND company_id = p_company_id)
	);
END