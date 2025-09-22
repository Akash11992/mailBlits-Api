CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sqm_sp_create_scheduler_template`(p_scheduler_rule_id int,p_company_id int,p_template_name varchar(205),p_description longtext,p_created_by varchar(45),campaign_id int,campaign_subject varchar(500))
BEGIN
insert into tbl_email_scedhuler_template_mapping(scheduler_rule_id,company_id,template_name,template_description,is_active,created_by,updated_by,campaign_id,campaign_subject)
values(p_scheduler_rule_id,p_company_id,p_template_name,p_description,1,p_created_by,p_created_by,campaign_id,campaign_subject);
END