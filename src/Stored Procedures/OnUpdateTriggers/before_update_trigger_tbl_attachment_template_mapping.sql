DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_attachment_template_mapping
BEFORE UPDATE ON mailblitzuat.tbl_attachment_template_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_attachment_template_mapping_logs 
    SELECT * FROM tbl_attachment_template_mapping WHERE mapping_id = OLD.mapping_id;
END; //

DELIMITER ;