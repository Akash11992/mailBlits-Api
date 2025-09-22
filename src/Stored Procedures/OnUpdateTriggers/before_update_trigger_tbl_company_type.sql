DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_company_type
BEFORE UPDATE ON mailblitzuat.tbl_company_type
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_company_type_logs 
    SELECT * FROM tbl_company_type WHERE company_type_id = OLD.company_type_id;
END; //

DELIMITER ;