DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_provider
BEFORE UPDATE ON mailblitzuat.tbl_email_provider
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_provider_logs 
    SELECT * FROM tbl_email_provider WHERE email_provider_id = OLD.email_provider_id;
END; //

DELIMITER ;