CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_addBusinessCompanyMapping`(
IN companyId INT,
IN businessId INT,
IN groupName VARCHAR(200),
IN p_created_by INT
)
BEGIN

            INSERT INTO tblbusinesscompanyMapping (
                businessId,
                companyId,
                groupName,
                isActive,
                action,
                createdBy,
                createdAt
            ) VALUES (
                businessId,
                companyId, 
                groupName,
                1, -- isActive
                'c',
                p_created_by,
                NOW() -- Assuming you want to set the created_at to current time
            );

END