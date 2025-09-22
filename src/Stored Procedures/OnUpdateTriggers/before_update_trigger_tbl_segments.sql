DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_segments
BEFORE UPDATE ON mailblitzuat.tbl_segments
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_segments_logs 
    SELECT * FROM tbl_segments WHERE segments_id = OLD.segments_id;
END; //

DELIMITER ;