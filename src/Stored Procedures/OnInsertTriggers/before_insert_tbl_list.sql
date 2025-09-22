DELIMITER //
CREATE TRIGGER before_insert_tbl_list
BEFORE INSERT ON  tbl_list
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(list_id), 0) INTO lastId
    FROM  tbl_list;

    SET NEW.list_id = lastId + 1;
END //

DELIMITER ;