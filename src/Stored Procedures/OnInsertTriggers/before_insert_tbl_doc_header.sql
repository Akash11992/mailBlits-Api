DELIMITER //
CREATE TRIGGER before_insert_tbl_doc_header
BEFORE INSERT ON tbl_doc_header
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(header_id), 0) INTO lastId
    FROM   tbl_doc_header;

    SET NEW.header_id	 = lastId + 1;
END //

DELIMITER ;