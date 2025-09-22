CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_activateBusiness`(
    IN p_businessId INT,
    IN p_userId INT
)
BEGIN
    UPDATE tblbusiness 
    SET isActive = 1,
        action = 'u', 
        createdBy = p_userId,
        createdAt = NOW()
    WHERE businessId = p_businessId;
END