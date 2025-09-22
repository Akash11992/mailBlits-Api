CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_role`(
    IN p_role_name VARCHAR(100),
	IN p_description varchar(2048),
	IN p_company_id INT,
    IN p_group_name VARCHAR(100),
    IN p_created_by INT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM tbl_role_master
        WHERE role_name = p_role_name AND company_id = p_company_id AND is_active = 1
    ) THEN
        INSERT INTO tbl_role_master (
            role_name, description,company_id,group_name , action, created_by, is_active
        )
        VALUES (p_role_name,p_description,p_company_id, p_group_name, 'c', p_created_by, 1);
    END IF;
END