DELIMITER //
CREATE TRIGGER before_insert_tbl_tax_types
BEFORE INSERT ON  tbl_tax_types
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(tax_type_id), 0) INTO lastId
    FROM  tbl_tax_types;

    SET NEW.tax_type_id = lastId + 1;
END //

DELIMITER ;