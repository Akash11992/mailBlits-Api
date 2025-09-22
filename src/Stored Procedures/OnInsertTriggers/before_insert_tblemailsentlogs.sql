DELIMITER //
CREATE TRIGGER before_insert_tblemailsentlogs
BEFORE INSERT ON  tblemailsentlogs
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(RowNo), 0) INTO lastId
    FROM  tblemailsentlogs;

    SET NEW.RowNo = lastId + 1;
END //

DELIMITER ;