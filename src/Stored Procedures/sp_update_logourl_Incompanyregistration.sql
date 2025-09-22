CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_logourl_Incompanyregistration`(p_cid int,p_cr_logo_url varchar(255))
BEGIN
UPDATE tbl_company_registration SET `cr_logo_url` =p_cr_logo_url WHERE cr_id=p_cid;

END