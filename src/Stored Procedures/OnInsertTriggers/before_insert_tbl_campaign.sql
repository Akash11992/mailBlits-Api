DELIMITER //
CREATE TRIGGER before_insert_tbl_campaign
BEFORE INSERT ON tbl_campaign
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(campaign_id), 0) INTO lastId
    FROM tbl_campaign;

    SET NEW.campaign_id = lastId + 1;
END //

DELIMITER ;