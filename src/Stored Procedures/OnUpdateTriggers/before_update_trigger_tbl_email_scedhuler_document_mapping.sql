DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_scedhuler_document_mapping
BEFORE UPDATE ON mailblitzuat.tbl_email_scedhuler_document_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_scedhuler_document_mapping_logs 
    SELECT * FROM tbl_email_scedhuler_document_mapping WHERE schedule_document_id = OLD.schedule_document_id;
END; //

DELIMITER ;