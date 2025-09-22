DELIMITER //

CREATE TRIGGER before_insert_tbl_document
BEFORE INSERT ON tbl_document
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(doc_id), 0) INTO lastId
    FROM tbl_document;

    SET NEW.doc_id = lastId + 1;
END //

DELIMITER ;