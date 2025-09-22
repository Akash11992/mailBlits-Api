DELIMITER //
CREATE TRIGGER before_insert_tbl_email_senders
BEFORE INSERT ON  tbl_email_senders
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(sender_id), 0) INTO lastId
    FROM  tbl_email_senders;

    SET NEW.sender_id = lastId + 1;
END //

DELIMITER ;