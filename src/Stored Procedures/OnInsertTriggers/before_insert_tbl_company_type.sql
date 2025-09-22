DELIMITER //
CREATE TRIGGER before_insert_tbl_company_type
BEFORE INSERT ON  tbl_company_type
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(company_type_id), 0) INTO lastId
    FROM  tbl_company_type;

    SET NEW.company_type_id = lastId + 1;
END //

DELIMITER ;