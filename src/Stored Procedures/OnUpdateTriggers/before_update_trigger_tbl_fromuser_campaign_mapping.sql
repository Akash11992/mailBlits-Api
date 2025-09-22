DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_fromuser_campaign_mapping
BEFORE UPDATE ON mailblitzuat.tbl_fromuser_campaign_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_fromuser_campaign_mapping_logs 
    SELECT * FROM tbl_fromuser_campaign_mapping WHERE user_campaign_mapping_id = OLD.user_campaign_mapping_id;
END; //

DELIMITER ;