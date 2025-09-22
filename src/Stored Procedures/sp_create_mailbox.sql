CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_mailbox`(p_company_id int,p_email_id varchar(100),p_oAuth_payload json,p_provider_id int,p_created_by int,p_exp_time bigint)
BEGIN
declare exist_count int;
select count(*) into exist_count from tbl_mailbox where company_id=p_company_id and email_id=p_email_id and is_active=1;
if exist_count>0 then
update tbl_mailbox set oAuth_payload=p_oAuth_payload , created_at=CURRENT_TIMESTAMP,expiration_time=p_exp_time where company_id=p_company_id and email_id=p_email_id and is_active=1;
else
INSERT INTO tbl_mailbox (company_id, email_id, oAuth_payload, provider_id, created_by,created_at,expiration_time,is_active) VALUES (
   p_company_id,p_email_id,p_oAuth_payload,p_provider_id,p_created_by, CURRENT_TIMESTAMP, p_exp_time ,1
);
end if;
END