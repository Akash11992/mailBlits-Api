DELIMITER //
CREATE TRIGGER before_insert_tbl_forget_password
BEFORE INSERT ON  tbl_forget_password
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(forget_password_id), 0) INTO lastId
    FROM  tbl_forget_password;

    SET NEW.forget_password_id = lastId + 1;
END //

DELIMITER ;