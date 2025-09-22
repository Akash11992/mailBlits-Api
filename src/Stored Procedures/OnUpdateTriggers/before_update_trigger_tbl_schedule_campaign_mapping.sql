DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_schedule_campaign_mapping
BEFORE UPDATE ON mailblitzuat.tbl_schedule_campaign_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_schedule_campaign_mapping_logs 
    SELECT * FROM tbl_schedule_campaign_mapping WHERE schedule_campaign_id = OLD.schedule_campaign_id;
END; //

DELIMITER ;