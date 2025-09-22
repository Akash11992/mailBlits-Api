DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_countries_master
BEFORE UPDATE ON mailblitzuat.tbl_countries_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_countries_master_logs 
    SELECT * FROM tbl_countries_master WHERE cm_id = OLD.cm_id;
END; //

DELIMITER ;