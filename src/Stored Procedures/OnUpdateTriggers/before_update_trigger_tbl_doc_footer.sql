DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_doc_footer
BEFORE UPDATE ON mailblitzuat.tbl_doc_footer
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_doc_footer_logs 
    SELECT * FROM tbl_doc_footer WHERE footer_id = OLD.footer_id;
END; //

DELIMITER ;
