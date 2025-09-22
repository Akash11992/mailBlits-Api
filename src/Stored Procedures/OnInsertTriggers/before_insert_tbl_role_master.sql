DELIMITER //
CREATE TRIGGER before_insert_tbl_role_master
BEFORE INSERT ON  tbl_role_master
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(role_id), 0) INTO lastId
    FROM  tbl_role_master;

    SET NEW.role_id = lastId + 1;
END //

DELIMITER ;