CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_delete_existing_doc_attached`(
    IN p_company_id INT,
    IN p_template_id INT,
    IN p_attachment_name TEXT
)
BEGIN

    DELETE FROM tbl_atchmt_tmplt_mapping 
    WHERE company_id = p_company_id 
        AND template_id = p_template_id 
        AND doc_id IS NOT NULL;

    DELETE FROM tbl_atchmt_tmplt_mapping 
    WHERE company_id = p_company_id 
        AND template_id = p_template_id 
        AND FIND_IN_SET(attachment_name, p_attachment_name) = 0 
        AND attachment_name IS NOT NULL;

END