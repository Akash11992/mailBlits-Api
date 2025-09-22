DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_template
BEFORE UPDATE ON mailblitzuat.tbl_template
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_template_logs 
    SELECT * FROM tbl_template WHERE template_id = OLD.template_id;
END; //
 
DELIMITER ;