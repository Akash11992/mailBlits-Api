DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_country_time_zone
BEFORE UPDATE ON mailblitzuat.tbl_country_time_zone
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_country_time_zone_logs 
    SELECT * FROM tbl_country_time_zone WHERE timezone_id = OLD.timezone_id;
END; //

DELIMITER ;