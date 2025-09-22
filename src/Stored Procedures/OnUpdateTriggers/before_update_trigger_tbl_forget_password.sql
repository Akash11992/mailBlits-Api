DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_forget_password
BEFORE UPDATE ON mailblitzuat.tbl_forget_password
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_forget_password_logs 
    SELECT * FROM tbl_forget_password WHERE forget_password_id = OLD.forget_password_id;
END; //

DELIMITER ;