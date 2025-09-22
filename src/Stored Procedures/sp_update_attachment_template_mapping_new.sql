CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_attachment_template_mapping_new`(
    IN p_company_id INT,
        IN p_template_id VARCHAR(125),
    IN p_file_name VARCHAR(200),
    IN p_file_type VARCHAR(100),
    IN p_file_path VARCHAR(200),
    IN p_updated_by VARCHAR(45)
)
BEGIN

-- Delete any existing records with the same template_id and non-null doc_id
-- DELETE FROM tbl_atchmt_tmplt_mapping WHERE company_id=p_company_id and template_id=p_template_id and  attachment_name IS NOT NULL;

        -- Insert into document template mapping table
        INSERT INTO tbl_atchmt_tmplt_mapping (
            company_id,
            template_id,
            attachment_name,
            attachment_type,
            attachment_path,
            is_active,
            created_by,
            updated_by
        )
        VALUES (
            p_company_id,
            p_template_id,
            p_file_name,
            p_file_type,
            p_file_path,
            1,
            p_updated_by,
            p_updated_by
        );

        SELECT "success" AS response;
   
END