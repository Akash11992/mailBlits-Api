DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_email_scheduler_rule_for_campaign
BEFORE UPDATE ON mailblitzuat.tbl_email_scheduler_rule_for_campaign
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_email_scheduler_rule_for_campaign_logs 
    SELECT * FROM tbl_email_scheduler_rule_for_campaign WHERE scheduler_rule_id = OLD.scheduler_rule_id;
END; //

DELIMITER ;