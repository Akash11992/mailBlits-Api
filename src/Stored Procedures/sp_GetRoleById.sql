CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_GetRoleById`(IN role_ids text, IN p_cids text)
BEGIN

    SELECT r.description,r.role_name ,
     r.role_id,r.company_id
    FROM tbl_role_master r
    WHERE 
    FIND_IN_SET(r.role_id,role_ids) >0
     AND FIND_IN_SET(r.company_id, p_cids) > 0
 AND r.is_active=1;
END