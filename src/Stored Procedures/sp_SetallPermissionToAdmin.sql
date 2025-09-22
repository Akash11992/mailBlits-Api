CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_SetallPermissionToAdmin`(
    p_companyid VARCHAR(50),
    p_created_by INT,
    p_role_mapping_id INT
)
BEGIN
    DECLARE get_form_id INT;
    DECLARE i INT DEFAULT 0;
    DECLARE total_records INT;

    -- Get the total number of records in tbl_forms
    SELECT COUNT(*) INTO total_records FROM tbl_forms;

    -- Loop through all form IDs and insert permissions
    WHILE i < total_records DO
        SELECT form_id INTO get_form_id FROM tbl_forms LIMIT i, 1;

        INSERT INTO tbl_role_mapping_with_forms (
            form_id, role_id, company_id, 
            is_create, is_update, is_view, is_delete,
            is_import, is_export, is_field, is_active, 
            created_by, `action`
        )
        VALUES (
             get_form_id, 
            (SELECT role_id FROM tbl_role_master WHERE company_id = p_companyid AND role_name = 'admin' AND is_active = 1),
            p_companyid, 1, 1, 1, 1, 1, 1, 1, 1, p_created_by, 'c'
        );

        SET i = i + 1;
    END WHILE;
END