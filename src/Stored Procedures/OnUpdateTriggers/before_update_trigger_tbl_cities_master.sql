DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_cities_master
BEFORE UPDATE ON mailblitzuat.tbl_cities_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_cities_master_logs 
    SELECT * FROM tbl_cities_master WHERE id = OLD.id;
END; //

DELIMITER ;