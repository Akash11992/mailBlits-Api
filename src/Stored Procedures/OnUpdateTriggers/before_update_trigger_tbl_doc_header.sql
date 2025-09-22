DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_doc_header
BEFORE UPDATE ON mailblitzuat.tbl_doc_header
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_doc_header_logs 
    SELECT * FROM tbl_doc_header WHERE header_id = OLD.header_id;
END; //

DELIMITER ;