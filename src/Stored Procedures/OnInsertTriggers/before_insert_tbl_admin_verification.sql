DELIMITER //
CREATE TRIGGER before_insert_tbl_admin_verification
BEFORE INSERT ON tbl_admin_verification
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(admin_verification_id), 0) INTO lastId
    FROM tbl_admin_verification;

    SET NEW.admin_verification_id = lastId + 1;
END //

DELIMITER ;