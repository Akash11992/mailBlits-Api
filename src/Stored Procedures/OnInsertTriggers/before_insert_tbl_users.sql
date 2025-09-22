DELIMITER //
CREATE TRIGGER before_insert_tbl_users
BEFORE INSERT ON  tbl_users
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(user_id), 0) INTO lastId
    FROM  tbl_users;

    SET NEW.user_id = lastId + 1;
END //

DELIMITER ;