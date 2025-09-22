DELIMITER //
CREATE TRIGGER before_insert_tbl_country_code
BEFORE INSERT ON    tbl_country_code
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(id), 0) INTO lastId
    FROM    tbl_country_code;

    SET NEW.id	 = lastId + 1;
END //

DELIMITER ;