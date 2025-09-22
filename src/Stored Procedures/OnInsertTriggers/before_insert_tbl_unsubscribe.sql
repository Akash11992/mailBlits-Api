DELIMITER //
CREATE TRIGGER before_insert_tbl_unsubscribe
BEFORE INSERT ON  tbl_unsubscribe
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(unsubscribe_id), 0) INTO lastId
    FROM  tbl_unsubscribe;

    SET NEW.unsubscribe_id = lastId + 1;
END //

DELIMITER ;