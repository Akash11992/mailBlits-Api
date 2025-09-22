DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_contact_file
BEFORE UPDATE ON mailblitzuat.tbl_contact_file
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_contact_file_logs 
    SELECT * FROM tbl_contact_file WHERE file_id = OLD.file_id;
END; //

DELIMITER ;