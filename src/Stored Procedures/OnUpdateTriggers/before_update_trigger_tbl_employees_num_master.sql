DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_employees_num_master
BEFORE UPDATE ON mailblitzuat.tbl_employees_num_master
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_employees_num_master_logs 
    SELECT * FROM tbl_employees_num_master WHERE enm_id = OLD.enm_id;
END; //

DELIMITER ;