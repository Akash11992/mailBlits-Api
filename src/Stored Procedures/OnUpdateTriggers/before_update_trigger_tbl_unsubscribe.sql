DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_unsubscribe
BEFORE UPDATE ON mailblitzuat.tbl_unsubscribe
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_unsubscribe_logs 
    SELECT * FROM tbl_unsubscribe WHERE unsubscribe_id = OLD.unsubscribe_id;
END; //

DELIMITER ;