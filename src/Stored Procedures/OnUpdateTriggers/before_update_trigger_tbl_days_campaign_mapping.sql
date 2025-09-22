DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_days_campaign_mapping
BEFORE UPDATE ON mailblitzuat.tbl_days_campaign_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_days_campaign_mapping_logs 
    SELECT * FROM tbl_days_campaign_mapping WHERE day_campaign_id = OLD.day_campaign_id;
END; //

DELIMITER ;
