CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_email_scheduler_rule_for_campaign_OnschedulingTime`(
    p_company_id INT,
    IN p_campaign_id int,
    in p_contact_id int,
    p_is_send_immediately TINYINT,
    IN p_schedule_date DATE,
    IN p_schedule_time TIME,
    IN p_schedule_timezone_id int,
    IN p_schedule_daily_limit INT,
    IN p_email_days_id int,
	p_send_email_date date,
    p_user_id INT,
    p_from_user_id INT,
    p_cc longtext,
    p_bcc longtext,
    p_isEmailTrackingEnabled TINYINT
)
BEGIN
declare p_schedule_id INT;
 IF p_is_send_immediately = 0 THEN

        
            INSERT INTO tbl_email_scheduler_rule_for_campaign(
                company_id, campaign_id, contact_id, is_send_immediately,
                scheduler_date, scheduler_time, scheduler_timezone_id,
                scheduler_daily_limit, email_days_id, email_status_id,
                email_date, created_by,user_status_id,from_user_id,cc,bcc,isEmailTrackingEnabled,action
            )
            VALUES (
                p_company_id, p_campaign_id, p_contact_id, p_is_send_immediately,
                p_schedule_date, p_schedule_time, p_schedule_timezone_id,
                p_schedule_daily_limit,p_email_days_id, 1,
                p_send_email_date, p_user_id,3,p_from_user_id,p_cc,p_bcc,
                p_isEmailTrackingEnabled,'c'
            );
             
    --    SET p_schedule_id = LAST_INSERT_ID();
    -- Fetch the last inserted ID directly by ordering by the primary key
            SELECT scheduler_rule_id INTO p_schedule_id
            FROM tbl_email_scheduler_rule_for_campaign
            ORDER BY scheduler_rule_id DESC
            LIMIT 1;
		SELECT "success24 schedule" AS response, p_schedule_id AS schedule_id; 
      
   end if;
END