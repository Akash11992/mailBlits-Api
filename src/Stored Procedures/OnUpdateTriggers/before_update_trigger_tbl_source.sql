DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_source
BEFORE UPDATE ON mailblitzuat.tbl_source
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_source_logs 
    SELECT * FROM tbl_source WHERE source_id = OLD.source_id;
END; //

DELIMITER ;