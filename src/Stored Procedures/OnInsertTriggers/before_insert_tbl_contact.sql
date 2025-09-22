DELIMITER //
CREATE TRIGGER before_insert_tbl_contact
BEFORE INSERT ON  tbl_contact
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(contact_id), 0) INTO lastId
    FROM  tbl_contact;

    SET NEW.contact_id = lastId + 1;
END //

DELIMITER ;