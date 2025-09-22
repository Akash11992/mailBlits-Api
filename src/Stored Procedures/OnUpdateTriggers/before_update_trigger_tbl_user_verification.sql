DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_user_verification
BEFORE UPDATE ON mailblitzuat.tbl_user_verification
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_user_verification_logs 
    SELECT * FROM tbl_user_verification WHERE user_verification_id = OLD.user_verification_id;
END; //

DELIMITER ;
