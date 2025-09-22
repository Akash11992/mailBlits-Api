CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_header`(p_company_id int, p_header_id int)
BEGIN
    IF p_header_id IS NULL THEN
        SELECT lh.header_id, lh.header_name, lh.description, u.full_name AS created_by
        FROM tbl_doc_header lh
        INNER JOIN tbl_users u ON u.user_id = lh.created_by
        WHERE lh.company_id = p_company_id AND lh.is_active = 1;
    ELSE
        SELECT lh.header_id, lh.header_name, lh.description, u.full_name AS created_by
        FROM tbl_doc_header lh
        INNER JOIN tbl_users u ON u.user_id = lh.created_by
        WHERE lh.header_id = p_header_id AND lh.company_id = p_company_id AND lh.is_active = 1;
    END IF;
    
    SELECT COUNT(*) AS count FROM tbl_doc_header WHERE company_id = p_company_id AND is_active = 1;
END