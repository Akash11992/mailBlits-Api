DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_role_mapping_with_forms
BEFORE UPDATE ON mailblitzuat.tbl_role_mapping_with_forms
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_role_mapping_with_forms_logs 
    SELECT * FROM tbl_role_mapping_with_forms WHERE role_mapping_id = OLD.role_mapping_id;
END; //

DELIMITER ;