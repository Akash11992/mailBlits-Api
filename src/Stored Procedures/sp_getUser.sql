CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getUser`(p_group_name varchar(100),p_company_id int)
BEGIN
SELECT ru.user_id as userId,ru.full_name AS username,
ru.email AS userEmail,ru.designation AS designationId,
ru.created_at as createdAt, ru.role_id AS roleId, 
ru.is_active AS isActive, 
r.role_name AS roleName, sdm.dm_name AS designation 
FROM `tbl_users` ru JOIN `tbl_role_master` r ON ru.role_id = r.role_id JOIN tbl_designation_master sdm ON dm_id=ru.designation
WHERE ru.is_active=1
AND
(
(p_group_name IS NOT NULL AND ru.group_name = p_group_name) OR 
(p_group_name IS NULL AND ru.company_id = p_company_id)
);
END