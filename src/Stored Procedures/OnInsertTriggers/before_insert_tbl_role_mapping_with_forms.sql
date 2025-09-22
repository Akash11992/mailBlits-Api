DELIMITER //

CREATE TRIGGER before_insert_tbl_role_mapping_with_forms
BEFORE INSERT ON tbl_role_mapping_with_forms
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(role_mapping_id), 0) INTO lastId
    FROM tbl_role_mapping_with_forms;

    SET NEW.role_mapping_id = lastId + 1;
END //

DELIMITER ;