DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_employee_count
BEFORE UPDATE ON mailblitzuat.tbl_employee_count
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_employee_count_logs 
    SELECT * FROM tbl_employee_count WHERE employee_count_id = OLD.employee_count_id;
END; //

DELIMITER ;