DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_user_status
BEFORE UPDATE ON mailblitzuat.tbl_user_status
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_user_status_logs 
    SELECT * FROM tbl_user_status WHERE user_status_id = OLD.user_status_id;
END; //

DELIMITER ;