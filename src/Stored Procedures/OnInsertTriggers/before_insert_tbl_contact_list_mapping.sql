DELIMITER //
CREATE TRIGGER before_insert_tbl_contact_list_mapping	
BEFORE INSERT ON  tbl_contact_list_mapping
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(contact_list_mapping_id), 0) INTO lastId
    FROM  tbl_contact_list_mapping;

    SET NEW.contact_list_mapping_id	 = lastId + 1;
END //

DELIMITER ;