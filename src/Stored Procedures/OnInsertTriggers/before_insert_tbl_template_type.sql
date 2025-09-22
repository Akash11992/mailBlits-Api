DELIMITER //
CREATE TRIGGER before_insert_tbl_template_type
BEFORE INSERT ON  tbl_template_type
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(template_type_id), 0) INTO lastId
    FROM  tbl_template_type;

    SET NEW.template_type_id = lastId + 1;
END //

DELIMITER ;