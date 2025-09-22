DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_country_code
BEFORE UPDATE ON mailblitzuat.tbl_country_code
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_country_code_logs 
    SELECT * FROM tbl_country_code WHERE id = OLD.id;
END; //

DELIMITER ;