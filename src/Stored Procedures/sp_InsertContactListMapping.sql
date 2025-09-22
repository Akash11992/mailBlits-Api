CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_InsertContactListMapping`(
  IN listId INT,
  IN companyId INT,
  IN contactIdList JSON,
  IN createdBy VARCHAR(255),
  IN updatedBy VARCHAR(255)
)
BEGIN
  
  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_validContactIds (
    id INT PRIMARY KEY
  );

  
  INSERT INTO tmp_validContactIds (id)
  SELECT value
  FROM JSON_TABLE(contactIdList, '$[*]' COLUMNS (value INT PATH '$')) AS parsed_contacts
  WHERE EXISTS (SELECT 1 FROM tbl_contact WHERE contact_id = parsed_contacts.value);

  
  INSERT INTO tbl_contact_list_mapping (company_id, list_id, contact_id, created_by, created_at,action)
  SELECT companyId, listId, id, createdBy, NOW(),'c'
  FROM tmp_validContactIds;
  
  
  DROP TEMPORARY TABLE IF EXISTS tmp_validContactIds;
END