DELIMITER //
CREATE TRIGGER before_insert_tbl_doc_format
BEFORE INSERT ON     tbl_doc_format
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(doc_format_id), 0) INTO lastId
    FROM  tbl_doc_format;

    SET NEW.doc_format_id	 = lastId + 1;
END //

DELIMITER ;