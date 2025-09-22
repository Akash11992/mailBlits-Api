DELIMITER //
CREATE TRIGGER before_insert_tbl_template
BEFORE INSERT ON  tbl_template
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(template_id), 0) INTO lastId
    FROM  tbl_template;

    SET NEW.template_id = lastId + 1;
END //

DELIMITER ;