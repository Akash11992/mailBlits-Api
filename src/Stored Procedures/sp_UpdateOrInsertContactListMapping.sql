CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_UpdateOrInsertContactListMapping`(IN listId INT, IN contactIdList JSON, IN companyId INT, IN createdBy INT, IN updatedBy INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE idx INT DEFAULT 0;
    DECLARE contactId INT;
    DECLARE contactCount INT;

    SET contactCount = JSON_LENGTH(contactIdList);

    WHILE idx < contactCount DO
        SET contactId = JSON_EXTRACT(contactIdList, CONCAT('$[', idx, ']'));

        IF EXISTS (SELECT 1 FROM tbl_contact_list_mapping WHERE list_id = listId AND con_id = contactId) THEN
            -- Contact exists, update the record
            UPDATE tbl_contact_list_mapping
            SET updated_by = updatedBy
            WHERE list_id = listId AND con_id = contactId;
        ELSE
            -- Contact doesn't exist, insert a new record
            INSERT INTO tbl_contact_list_mapping (company_id, list_id, con_id, created_by, updated_by)
            VALUES (companyId, listId, contactId, createdBy, updatedBy);
        END IF;

        SET idx = idx + 1;
    END WHILE;
END