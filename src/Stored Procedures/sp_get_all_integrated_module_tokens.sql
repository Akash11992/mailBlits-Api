CREATE PROCEDURE `sp_store_integrated_module_token`(IN p_module_id INT, IN p_token varchar(250), IN p_created_by INT)
BEGIN
   DECLARE v_count INT;
   
   -- Check if module_id exists
    SELECT COUNT(*) INTO v_count
    FROM tbl_integrated_module_tokens
    WHERE module_id = p_module_id and created_by = p_created_by;

    IF v_count > 0 THEN
        -- Update existing record
        UPDATE tbl_integrated_module_tokens
        SET token = p_token,
            updated_at = NOW(),
            updated_by = p_created_by
        WHERE module_id = p_module_id;
    ELSE
        -- Insert new record
        INSERT INTO tbl_integrated_module_tokens (
            module_id, token, created_at, created_by
        ) VALUES (
            p_module_id, p_token, NOW(), p_created_by
        );
    END IF;
END