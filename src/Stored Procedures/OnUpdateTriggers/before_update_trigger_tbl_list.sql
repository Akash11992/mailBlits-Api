DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_list
BEFORE UPDATE ON mailblitzuat.tbl_list
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_list_logs 
    SELECT * FROM tbl_list WHERE list_id = OLD.list_id;
END; //

DELIMITER ;
