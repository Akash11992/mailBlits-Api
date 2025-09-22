DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_days
BEFORE UPDATE ON mailblitzuat.tbl_days
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_days_logs 
    SELECT * FROM tbl_days WHERE day_id = OLD.day_id;
END; //

DELIMITER ;