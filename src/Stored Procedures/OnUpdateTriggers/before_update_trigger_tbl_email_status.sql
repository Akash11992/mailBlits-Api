DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_status
BEFORE UPDATE ON mailblitzuat.tbl_email_status
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_status_logs 
    SELECT * FROM tbl_email_status WHERE email_status_id = OLD.email_status_id;
END; //

DELIMITER ;