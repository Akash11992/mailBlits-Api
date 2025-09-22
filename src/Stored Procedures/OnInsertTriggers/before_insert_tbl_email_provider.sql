DELIMITER //
CREATE TRIGGER before_insert_tbl_email_provider
BEFORE INSERT ON tbl_email_provider
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(email_provider_id), 0) INTO lastId
    FROM   tbl_email_provider;

    SET NEW.email_provider_id = lastId + 1;
END //

DELIMITER ;