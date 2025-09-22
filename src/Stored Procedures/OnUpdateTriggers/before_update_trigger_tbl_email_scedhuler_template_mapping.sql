DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_scedhuler_template_mapping
BEFORE UPDATE ON mailblitzuat.tbl_email_scedhuler_template_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_scedhuler_template_mapping_logs 
    SELECT * FROM tbl_email_scedhuler_template_mapping WHERE schedule_template_id = OLD.schedule_template_id;
END; //

DELIMITER ;