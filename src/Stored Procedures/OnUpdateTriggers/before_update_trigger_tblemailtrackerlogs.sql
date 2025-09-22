DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tblemailtrackerlogs
BEFORE UPDATE ON mailblitzuat.tblemailtrackerlogs
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tblemailtrackerlogs_logs 
    SELECT * FROM tblemailtrackerlogs WHERE RowID = OLD.RowID;
END; //

DELIMITER ;