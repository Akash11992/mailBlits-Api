DELIMITER //
CREATE TRIGGER before_insert_tbl_countries_master
BEFORE INSERT ON   tbl_countries_master
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(cm_id), 0) INTO lastId
    FROM   tbl_countries_master;

    SET NEW.cm_id	 = lastId + 1;
END //

DELIMITER ;