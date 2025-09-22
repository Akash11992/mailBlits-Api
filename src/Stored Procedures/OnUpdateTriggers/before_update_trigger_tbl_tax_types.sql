DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_tax_types
BEFORE UPDATE ON mailblitzuat.tbl_tax_types
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_tax_types_logs 
    SELECT * FROM tbl_tax_types WHERE tax_type_id = OLD.tax_type_id;
END; //

DELIMITER ;