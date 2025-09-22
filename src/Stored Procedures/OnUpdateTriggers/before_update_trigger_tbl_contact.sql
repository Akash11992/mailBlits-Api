DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_contact
BEFORE UPDATE ON mailblitzuat.tbl_contact
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_contact_logs 
    SELECT * FROM tbl_contact WHERE contact_id = OLD.contact_id;
END; //

DELIMITER ;