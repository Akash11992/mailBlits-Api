DELIMITER //
CREATE TRIGGER before_insert_tbl_days
BEFORE INSERT ON     tbl_days
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(day_id), 0) INTO lastId
    FROM tbl_days;

    SET NEW.day_id	 = lastId + 1;
END //

DELIMITER ;