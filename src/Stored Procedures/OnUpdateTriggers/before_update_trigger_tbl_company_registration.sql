DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_company_registration
BEFORE UPDATE ON mailblitzuat.tbl_company_registration
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_company_registration_logs 
    SELECT * FROM tbl_company_registration WHERE company_id = OLD.company_id;
END; //

DELIMITER ;