DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_role_master
BEFORE UPDATE ON mailblitzuat.tbl_role_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_role_master_logs 
    SELECT * FROM tbl_role_master WHERE role_id = OLD.role_id;
END; //

DELIMITER ;