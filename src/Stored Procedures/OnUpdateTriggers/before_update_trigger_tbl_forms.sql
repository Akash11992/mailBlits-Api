DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_forms
BEFORE UPDATE ON mailblitzuat.tbl_forms
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_forms_logs 
    SELECT * FROM tbl_forms WHERE form_id = OLD.form_id;
END; //

DELIMITER ;