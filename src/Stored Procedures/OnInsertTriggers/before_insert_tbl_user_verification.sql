DELIMITER //
CREATE TRIGGER before_insert_tbl_user_verification
BEFORE INSERT ON  tbl_user_verification
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(user_verification_id), 0) INTO lastId
    FROM  tbl_user_verification;

    SET NEW.user_verification_id = lastId + 1;
END //

DELIMITER ;