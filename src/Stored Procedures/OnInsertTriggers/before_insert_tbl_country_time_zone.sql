DELIMITER //
CREATE TRIGGER before_insert_tbl_country_time_zone
BEFORE INSERT ON     tbl_country_time_zone
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(timezone_id), 0) INTO lastId
    FROM   tbl_country_time_zone;

    SET NEW.timezone_id	 = lastId + 1;
END //

DELIMITER ;