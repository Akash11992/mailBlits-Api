DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_doc_format
BEFORE UPDATE ON mailblitzuat.tbl_doc_format
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_doc_format_logs 
    SELECT * FROM tbl_doc_format WHERE doc_format_id = OLD.doc_format_id;
END; //

DELIMITER ;