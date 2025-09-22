DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_mailbox
BEFORE UPDATE ON mailblitzuat.tbl_mailbox
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_mailbox_logs 
    SELECT * FROM tbl_mailbox WHERE mailbox_id = OLD.mailbox_id;
END; //

DELIMITER ;