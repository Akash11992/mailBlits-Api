DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_template_type
BEFORE UPDATE ON mailblitzuat.tbl_template_type
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_template_type_logs 
    SELECT * FROM tbl_template_type WHERE template_type_id = OLD.template_type_id;
END; //

DELIMITER ;