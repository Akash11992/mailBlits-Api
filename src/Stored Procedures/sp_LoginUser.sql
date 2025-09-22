CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_LoginUser`(IN userEmail VARCHAR(255))
BEGIN
    SELECT
        tru.user_id AS id,
        tru.password AS pas,
        tru.email AS email,
        tru.is_active,
        tru.is_email_verified,
        tru.is_admin_approval,
        tru.full_name AS name,
        tru.designation AS designation,
        tru.role_id AS roleId,
        r.role_name,
        tru.company_id AS companyId,
        tru.is_individual,
        cr.logo_url,
        cr.is_group_company,
        cr.group_name
    FROM
        tbl_users tru
        LEFT JOIN tbl_company_registration cr ON tru.company_id = cr.company_id and cr.is_active=1
 left join tbl_role_master r on tru.role_id=r.role_id and tru.company_id = r.company_id and r.is_active=1
 WHERE
        tru.email = userEmail and tru.is_active=1;
END