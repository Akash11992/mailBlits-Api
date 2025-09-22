DELIMITER //
CREATE TRIGGER before_insert_tbl_days_campaign_mapping
BEFORE INSERT ON     tbl_days_campaign_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(day_campaign_id), 0) INTO lastId
    FROM tbl_days_campaign_mapping;

    SET NEW.day_campaign_id	 = lastId + 1;
END //

DELIMITER ;