CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_Insert_mailbox`(
    IN p_company_id INT,
    IN p_email_id VARCHAR(255),
    IN p_isLinked BOOLEAN,
    IN p_created_by VARCHAR(255),
    IN p_provider_id INT,
    IN p_is_active BOOLEAN
)
BEGIN
    INSERT INTO tbl_mailbox (company_id, email_id, isLinked, created_by, provider_id, is_active,action)
    VALUES (p_company_id, p_email_id, p_isLinked, p_created_by, p_provider_id, p_is_active,'c');
END