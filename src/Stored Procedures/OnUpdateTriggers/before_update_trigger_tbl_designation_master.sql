DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_designation_master
BEFORE UPDATE ON mailblitzuat.tbl_designation_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_designation_master_logs 
    SELECT * FROM tbl_designation_master WHERE dm_id = OLD.dm_id;
END; //

DELIMITER ;