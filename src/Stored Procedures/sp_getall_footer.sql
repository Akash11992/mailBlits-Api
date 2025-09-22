CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_footer`(p_company_id int, p_footer_id int)
BEGIN
    IF p_footer_id IS NULL THEN
        SELECT lh.footer_id, lh.footer_name, lh.description, u.full_name AS created_by
        FROM tbl_doc_footer lh
        INNER JOIN tbl_users u ON u.user_id = lh.created_by
        WHERE lh.company_id = p_company_id AND lh.is_active = 1;
    ELSE
        SELECT lh.footer_id, lh.footer_name, lh.description, u.full_name AS created_by
        FROM tbl_doc_footer lh
        INNER JOIN tbl_users u ON u.ru_id = lh.created_by
        WHERE lh.footer_id = p_footer_id AND lh.company_id = p_company_id AND lh.is_active = 1;
    END IF;
    
    SELECT COUNT(*) AS count FROM tbl_doc_footer WHERE company_id = p_company_id AND is_active = 1;
END