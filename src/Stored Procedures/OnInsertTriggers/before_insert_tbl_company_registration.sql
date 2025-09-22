DELIMITER //
CREATE TRIGGER before_insert_tbl_company_registration
BEFORE INSERT ON tbl_company_registration
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(company_id), 0) INTO lastId
    FROM tbl_company_registration;

    SET NEW.company_id = lastId + 1;
END //

DELIMITER ;