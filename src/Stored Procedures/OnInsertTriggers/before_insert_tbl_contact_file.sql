DELIMITER //
CREATE TRIGGER before_insert_tbl_contact_file
BEFORE INSERT ON  tbl_contact_file
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(file_id), 0) INTO lastId
    FROM  tbl_contact_file;

    SET NEW.file_id = lastId + 1;
END //

DELIMITER ;