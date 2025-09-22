DELIMITER //
CREATE TRIGGER before_insert_tbl_state_master
BEFORE INSERT ON  tbl_state_master
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(id), 0) INTO lastId
    FROM  tbl_state_master;

    SET NEW.id = lastId + 1;
END //

DELIMITER ;