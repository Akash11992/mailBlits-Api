CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_active_campaign_list`(p_company_id int)
BEGIN
select campaign_id,campaign_name from tbl_campaign where is_active=1 and company_id=p_company_id;
select count(*) as count from tbl_campaign where is_active=1 and company_id=p_company_id;
END