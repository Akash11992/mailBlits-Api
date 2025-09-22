DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_document
BEFORE UPDATE ON mailblitzuat.tbl_document
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_document_logs 
    SELECT * FROM tbl_document WHERE doc_id = OLD.doc_id;
END; //

DELIMITER ;