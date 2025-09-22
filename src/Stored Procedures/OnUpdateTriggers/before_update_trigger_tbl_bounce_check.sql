DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_bounce_check
BEFORE UPDATE ON mailblitzuat.tbl_bounce_check
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_bounce_check_logs 
    SELECT * FROM tbl_bounce_check WHERE bounce_check_id = OLD.bounce_check_id;
END; //

DELIMITER ;