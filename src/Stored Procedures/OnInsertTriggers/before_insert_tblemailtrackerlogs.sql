DELIMITER //
CREATE TRIGGER before_insert_tblemailtrackerlogs
BEFORE INSERT ON  tblemailtrackerlogs
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(RowID), 0) INTO lastId
    FROM  tblemailtrackerlogs;

    SET NEW.RowID = lastId + 1;
END //

DELIMITER ;