CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_insertBusiness`(
    IN p_userId INT,
    IN p_businessName VARCHAR(200),
    IN p_groupName VARCHAR(200)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM tblbusiness
        WHERE businessName = p_businessName
        AND groupName = p_groupName
        AND isActive = 1 
    ) THEN

        INSERT INTO tblbusiness (businessName, groupName, action, isActive, createdBy, createdAt)
        VALUES (p_businessName, p_groupName, 'c', 1, p_userId, NOW());
    ELSE
        
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Business already exists';
    END IF;
END