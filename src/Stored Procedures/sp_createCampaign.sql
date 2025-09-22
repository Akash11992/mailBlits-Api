CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_createCampaign`(  
IN p_company_id INT,
IN p_campaign_name VARCHAR(150),
IN p_to_segment_id VARCHAR(150),
IN p_to_list_id VARCHAR(150),
IN p_from_user_id int,

IN p_content_template_id VARCHAR(150),
IN p_send_immediately boolean,
IN p_schedule_date date,
IN p_schedule_time time,
IN p_schedulule_timezone varchar(200),
IN p_schedule_daily_limit int,
in p_created_by varchar(45),
in p_cc longtext,
in p_bcc longtext,
in p_subject longtext,
in p_isEmailTrackingEnabled TINYINT,
in p_isNeverExpire TINYINT,
in p_isApproval TINYINT
 )
BEGIN
    DECLARE campaignExists INT;

 SELECT COUNT(*) INTO campaignExists
    FROM tbl_campaign
    WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND action != 'd';

    IF campaignExists > 0 THEN
        SELECT "fail" AS response;
        else
  INSERT INTO tbl_campaign (company_id, campaign_name,to_segment_id,to_list_id,content_template_id,send_immediately,action, created_by,cc,bcc,subject,is_emailTracking,from_user_id,is_neverExpire,is_approvalRequire)
 VALUES (p_company_id, p_campaign_name,p_to_segment_id,p_to_list_id,p_content_template_id,p_send_immediately, 'c', p_created_by,p_cc,p_bcc,p_subject,p_isEmailTrackingEnabled,p_from_user_id,p_isNeverExpire,p_isApproval);
     
call sp_create_fromUser_campaign_mapping(p_company_id,p_campaign_name,p_from_user_id,p_created_by);

call sp_create_schedule_campaign_mapping(p_company_id,p_campaign_name,p_schedule_date,p_schedule_time,p_schedulule_timezone,p_schedule_daily_limit,p_created_by);

call sp_create_email_scheduler_rule_for_campaign_OnSendImmediately(p_company_id,p_campaign_name,p_to_list_id,p_send_immediately,p_created_by,p_from_user_id,p_cc,p_bcc,p_isEmailTrackingEnabled);

SELECT campaign_id 
    FROM tbl_campaign
    WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND action != 'd';
SELECT "success" AS response;
        end if;
END