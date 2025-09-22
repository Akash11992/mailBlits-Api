DELIMITER //
CREATE TRIGGER before_insert_tbl_user_status
BEFORE INSERT ON  tbl_user_status
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(user_status_id), 0) INTO lastId
    FROM  tbl_user_status;

    SET NEW.user_status_id = lastId + 1;
END //

DELIMITER ;