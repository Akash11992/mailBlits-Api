CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_InsertList`(
    IN listName VARCHAR(255),
    IN companyId INT,
    IN createdBy VARCHAR(255),
    IN updatedBy VARCHAR(255),
    OUT newListId INT
)
BEGIN
    -- Insert into tbl_list
    INSERT INTO tbl_list (company_id, list_name, created_by)
    VALUES (companyId, listName, createdBy);

    -- Get the newly inserted list_id
    SET newListId = LAST_INSERT_ID();
END