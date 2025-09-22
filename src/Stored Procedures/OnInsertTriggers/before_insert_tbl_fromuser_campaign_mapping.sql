DELIMITER //
CREATE TRIGGER before_insert_tbl_fromuser_campaign_mapping
BEFORE INSERT ON  tbl_fromuser_campaign_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(user_campaign_mapping_id), 0) INTO lastId
    FROM  tbl_fromuser_campaign_mapping;

    SET NEW.user_campaign_mapping_id = lastId + 1;
END //

DELIMITER ;