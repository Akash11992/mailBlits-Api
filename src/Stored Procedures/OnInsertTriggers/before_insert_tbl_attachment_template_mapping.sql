DELIMITER //
CREATE TRIGGER before_insert_tbl_attachment_template_mapping
BEFORE INSERT ON tbl_attachment_template_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(mapping_id), 0) INTO lastId
    FROM tbl_attachment_template_mapping;

    SET NEW.mapping_id = lastId + 1;
END //

DELIMITER ;