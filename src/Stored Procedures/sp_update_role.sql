CREATE DEFINER=`digicmysql`@`%` PROCEDURE `sp_update_role`(
    IN p_role_name VARCHAR(100),
    IN p_description LONGTEXT,
    IN p_role_id INT,
    IN p_company_id INT
)
BEGIN
    DECLARE recordExists INT;

    -- Check if both role_id and company_id exist together in the table
    SELECT COUNT(*) INTO recordExists
    FROM tbl_role_master
    WHERE role_id = p_role_id
      AND company_id = p_company_id;

    IF recordExists > 0 THEN
        
        UPDATE tbl_role_master 
        SET role_name = p_role_name, 
            description = p_description, 
            action = 'u'
        WHERE role_id = p_role_id
          AND company_id = p_company_id;
    ELSE
        
        INSERT INTO tbl_role_master (role_name, description, role_id, company_id, action)
        VALUES (p_role_name, p_description, p_role_id, p_company_id, 'i');
    END IF;
END