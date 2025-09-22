DELIMITER //
CREATE TRIGGER before_insert_tblbouceemaildetails
BEFORE INSERT ON  tblbouceemaildetails
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(RowID), 0) INTO lastId
    FROM  tblbouceemaildetails;

    SET NEW.RowID = lastId + 1;
END //

DELIMITER ;