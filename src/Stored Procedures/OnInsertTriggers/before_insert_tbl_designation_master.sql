DELIMITER //
CREATE TRIGGER before_insert_tbl_designation_master
BEFORE INSERT ON     tbl_designation_master
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(dm_id), 0) INTO lastId
    FROM tbl_designation_master;

    SET NEW.dm_id	 = lastId + 1;
END //

DELIMITER ;