DELIMITER //
CREATE TRIGGER  before_update_trigger_tbl_admin_verification
BEFORE UPDATE ON mailblitzuat.tbl_admin_verification
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_admin_verification_logs
    SELECT * FROM tbl_admin_verification WHERE admin_verification_id = OLD.admin_verification_id;
END; //
 
DELIMITER ;