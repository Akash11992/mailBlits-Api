DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_letter_heads
BEFORE UPDATE ON mailblitzuat.tbl_letter_heads
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_letter_heads_logs 
    SELECT * FROM tbl_letter_heads WHERE letter_head_id = OLD.letter_head_id;
END; //

DELIMITER ;
