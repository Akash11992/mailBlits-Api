DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tblemailsentlogs
BEFORE UPDATE ON mailblitzuat.tblemailsentlogs
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tblemailsentlogs_logs 
    SELECT * FROM tblemailsentlogs WHERE RowNo = OLD.RowNo;
END; //

DELIMITER ;