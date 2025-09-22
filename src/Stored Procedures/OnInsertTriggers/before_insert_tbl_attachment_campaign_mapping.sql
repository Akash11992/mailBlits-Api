DELIMITER //
CREATE TRIGGER before_insert_tbl_attachment_campaign_mapping
BEFORE INSERT ON tbl_attachment_campaign_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(attachment_campaign_id), 0) INTO lastId
    FROM tbl_attachment_campaign_mapping;

    SET NEW.attachment_campaign_id = lastId + 1;
END //

DELIMITER ;