CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_mailbox_user`(p_company_id int)
BEGIN
SELECT mb.mailbox_id,mb.email_id,mb.provider_id,ep.email_provider_name,mb.created_at,mb.oAuth_payload FROM tbl_mailbox mb INNER JOIN tbl_email_provider ep ON mb.provider_id=ep.email_provider_id where mb.company_id=p_company_id and mb.is_active=1;

END