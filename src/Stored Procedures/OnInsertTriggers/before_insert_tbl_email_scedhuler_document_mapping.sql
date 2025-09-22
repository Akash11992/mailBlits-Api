DELIMITER //
CREATE TRIGGER before_insert_tbl_email_scedhuler_document_mapping
BEFORE INSERT ON tbl_email_scedhuler_document_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(schedule_document_id), 0) INTO lastId
    FROM   tbl_email_scedhuler_document_mapping;

    SET NEW.schedule_document_id = lastId + 1;
END //

DELIMITER ;