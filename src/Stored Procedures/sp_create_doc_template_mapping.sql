CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_doc_template_mapping`(
    IN p_company_id INT,
    IN p_temp_name VARCHAR(125),
    IN p_doc_id TEXT,
    IN p_created_by VARCHAR(45)
)
BEGIN
    DECLARE previous_id INT;
    DECLARE new_id INT;
    DECLARE p_template_id INT;

        -- Get the newly inserted template ID
        SELECT tem_id INTO p_template_id
        FROM tbl_template
        WHERE tem_name = p_temp_name AND tem_company_id = p_company_id AND tem_is_active = 1;

        -- Generate a new document mapping ID
        IF (SELECT MAX(mapping_id) FROM tbl_atchmt_tmplt_mapping) > 0 THEN
            SELECT MAX(mapping_id) INTO previous_id FROM tbl_atchmt_tmplt_mapping;
            SET new_id = previous_id + 1;
        ELSE
            SET new_id = 1;
        END IF;

        -- Insert into document template mapping table
        INSERT INTO tbl_atchmt_tmplt_mapping (
            mapping_id,
            company_id,
            template_id,
            doc_id,
            is_active,
            created_by,
            updated_by
        )
        VALUES (
            new_id,
            p_company_id,
            p_template_id,
            p_doc_id,
            1,
            p_created_by,
            p_created_by
        );

        SELECT "success" AS response;
   
END