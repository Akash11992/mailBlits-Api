DELIMITER //
CREATE TRIGGER before_insert_tbl_schedule_campaign_mapping
BEFORE INSERT ON tbl_schedule_campaign_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(schedule_campaign_id), 0) INTO lastId
    FROM tbl_schedule_campaign_mapping;

    SET NEW.schedule_campaign_id = lastId + 1;
END //

DELIMITER ;