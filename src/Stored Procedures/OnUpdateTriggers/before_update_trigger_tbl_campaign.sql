DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_campaign
BEFORE UPDATE ON mailblitzuat.tbl_campaign
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_campaign_logs 
    SELECT * FROM tbl_campaign WHERE campaign_id = OLD.campaign_id;
END; //

DELIMITER ;