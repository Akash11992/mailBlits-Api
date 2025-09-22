DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_contact_list_mapping
BEFORE UPDATE ON mailblitzuat.tbl_contact_list_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_contact_list_mapping_logs 
    SELECT * FROM tbl_contact_list_mapping WHERE contact_list_mapping_id = OLD.contact_list_mapping_id;
END; //

DELIMITER ;