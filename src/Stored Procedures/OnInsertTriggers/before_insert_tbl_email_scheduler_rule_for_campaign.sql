DELIMITER //
CREATE TRIGGER before_insert_tbl_email_scheduler_rule_for_campaign
BEFORE INSERT ON  tbl_email_scheduler_rule_for_campaign
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(scheduler_rule_id), 0) INTO lastId
    FROM    tbl_email_scheduler_rule_for_campaign;

    SET NEW.scheduler_rule_id = lastId + 1;
END //

DELIMITER ;