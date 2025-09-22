DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tblbouceemaildetails
BEFORE UPDATE ON mailblitzuat.tblbouceemaildetails
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tblbouceemaildetails_logs 
    SELECT * FROM tblbouceemaildetails WHERE RowID = OLD.RowID;
END; //

DELIMITER ;