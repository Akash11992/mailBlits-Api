DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_users
BEFORE UPDATE ON mailblitzuat.tbl_users
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_users_logs 
    SELECT * FROM tbl_users WHERE user_id = OLD.user_id;
END; //

DELIMITER ;
