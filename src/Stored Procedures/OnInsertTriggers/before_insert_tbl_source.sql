DELIMITER //
CREATE TRIGGER before_insert_tbl_source
BEFORE INSERT ON  tbl_source
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(source_id), 0) INTO lastId
    FROM  tbl_source;

    SET NEW.source_id = lastId + 1;
END //

DELIMITER ;