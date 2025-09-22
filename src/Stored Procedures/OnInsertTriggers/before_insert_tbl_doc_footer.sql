DELIMITER //
CREATE TRIGGER before_insert_tbl_doc_footer
BEFORE INSERT ON      tbl_doc_footer
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(footer_id), 0) INTO lastId
    FROM  tbl_doc_footer;

    SET NEW.footer_id	 = lastId + 1;
END //

DELIMITER ;