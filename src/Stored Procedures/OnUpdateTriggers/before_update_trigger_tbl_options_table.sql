DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_options_table
BEFORE UPDATE ON mailblitzuat.tbl_options_table
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_options_table_logs 
    SELECT * FROM tbl_options_table WHERE option_id = OLD.option_id;
END; //

DELIMITER ;