DELIMITER //
CREATE TRIGGER before_insert_tbl_options_table
BEFORE INSERT ON  tbl_options_table
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(option_id), 0) INTO lastId
    FROM  tbl_options_table;

    SET NEW.option_id = lastId + 1;
END //

DELIMITER ;