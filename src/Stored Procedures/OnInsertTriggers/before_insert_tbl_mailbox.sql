DELIMITER //
CREATE TRIGGER before_insert_tbl_mailbox
BEFORE INSERT ON  tbl_mailbox
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(mailbox_id), 0) INTO lastId
    FROM  tbl_mailbox;

    SET NEW.mailbox_id = lastId + 1;
END //

DELIMITER ;