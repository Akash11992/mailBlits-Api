DELIMITER //
CREATE TRIGGER before_insert_tbl_forms
BEFORE INSERT ON  tbl_forms
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(form_id), 0) INTO lastId
    FROM  tbl_forms;

    SET NEW.form_id = lastId + 1;
END //

DELIMITER ;