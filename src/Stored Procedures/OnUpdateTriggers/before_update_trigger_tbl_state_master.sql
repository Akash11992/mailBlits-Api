DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_state_master
BEFORE UPDATE ON mailblitzuat.tbl_state_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_state_master_logs 
    SELECT * FROM tbl_state_master WHERE id = OLD.id;
END; //

DELIMITER ;