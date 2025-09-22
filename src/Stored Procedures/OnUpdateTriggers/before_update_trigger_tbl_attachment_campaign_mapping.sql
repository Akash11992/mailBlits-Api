DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_attachment_campaign_mapping
BEFORE UPDATE ON mailblitzuat.tbl_attachment_campaign_mapping
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_attachment_campaign_mapping_logs 
    SELECT * FROM tbl_attachment_campaign_mapping WHERE attachment_campaign_id = OLD.attachment_campaign_id;
END; //

DELIMITER ;