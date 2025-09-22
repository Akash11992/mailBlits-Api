DELIMITER //
CREATE TRIGGER before_insert_tbl_modules
BEFORE INSERT ON tbl_modules
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(module_id), 0) INTO lastId
    FROM tbl_modules;

    SET NEW.module_id = lastId + 1;
END //

DELIMITER ;