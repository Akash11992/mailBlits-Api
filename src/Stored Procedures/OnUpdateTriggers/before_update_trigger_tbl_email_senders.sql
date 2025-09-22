DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_senders
BEFORE UPDATE ON mailblitzuat.tbl_email_senders
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_senders_logs 
    SELECT * FROM tbl_email_senders WHERE sender_id = OLD.sender_id;
END; //

DELIMITER ;
