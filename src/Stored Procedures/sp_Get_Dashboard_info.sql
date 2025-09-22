CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_Get_Dashboard_info`(IN p_company_id INT)
BEGIN
    -- Declare variables
    DECLARE v_email_status_active_count INT;
    DECLARE v_email_status_sent_count INT;
    DECLARE v_email_status_in_queue_count INT;
    DECLARE v_total_contact_count INT;
    DECLARE v_today_contact_count INT;
    DECLARE v_opened_count INT;
    DECLARE v_clicked_count INT;
    DECLARE v_unopened_count INT;
    DECLARE v_bounce_count INT;
    DECLARE v_unsubscribe_count INT;
    DECLARE v_open_percentage DECIMAL(5, 2);
    DECLARE v_active_percentage DECIMAL(5, 2);
    DECLARE v_clicked_percentage DECIMAL(5, 2);
    DECLARE v_sent_percentage DECIMAL(5, 2);
    DECLARE v_total_active_records INT;

    -- Declare a variable for campaign list
    DECLARE v_campaignList JSON DEFAULT '[]';

    -- Get the campaign list for the provided company_id
    SELECT JSON_ARRAYAGG(JSON_OBJECT('campaign_id', campaign_id, 'campaign_name', campaign_name))
    INTO v_campaignList
    FROM tbl_campaign
    WHERE company_id = p_company_id;

    -- Get the count of total active records in tbl_email_scheduler_rule_for_campaign
    SELECT COUNT(*) INTO v_total_active_records
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND is_active = 1;

    -- Get the count of rows where email_status_id=1 (active)
    SELECT COUNT(*) INTO v_email_status_active_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND email_status_id = 1 AND is_active = 1;

    -- Get the count of rows where email_status_id=2 (sent)
    SELECT COUNT(*) INTO v_email_status_sent_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND email_status_id = 2 AND is_active = 1;

    -- Get the count of rows where email_status_id=4 (in_queue)
    SELECT COUNT(*) INTO v_email_status_in_queue_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND email_status_id = 4 AND is_active = 1;

    -- Get the total count of rows from tbl_contact where company_id matches
    SELECT COUNT(*) INTO v_total_contact_count
    FROM tbl_contact
    WHERE company_id = p_company_id AND is_active = 1;

    -- Get the count of rows from tbl_contact where created_at is today and company_id matches
    SELECT COUNT(*) INTO v_today_contact_count
    FROM tbl_contact
    WHERE company_id = p_company_id AND DATE(created_at) = CURDATE() AND is_active = 1;

    -- Get the count of rows where user_status_id=1 (opened)
    SELECT COUNT(*) INTO v_opened_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND user_status_id = 1 AND is_active = 1;

    -- Get the count of rows where user_status_id=2 (clicked)
    SELECT COUNT(*) INTO v_clicked_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND user_status_id = 2 AND is_active = 1;

    -- Get the count of rows where user_status_id=4 (unopened)
    SELECT COUNT(*) INTO v_unopened_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND user_status_id = 4 AND is_active = 1;

    -- Get the count of rows where email_status_id=6 (bounce)
    SELECT COUNT(*) INTO v_bounce_count
    FROM tbl_email_scheduler_rule_for_campaign
    WHERE company_id = p_company_id AND email_status_id = 6 AND is_active = 1;

    -- Get the count of unsubscribe
    SELECT COUNT(DISTINCT email) INTO v_unsubscribe_count
    FROM tbl_unsubscribe
    WHERE company_id = p_company_id;

    -- Calculate percentages and cap them at 999.99
    SET v_open_percentage = LEAST(IF(v_total_active_records > 0, (v_opened_count / v_total_active_records) * 100, 0), 999.99);
    SET v_active_percentage = LEAST(IF(v_total_active_records > 0, (v_email_status_active_count / v_total_active_records) * 100, 0), 999.99);
    SET v_clicked_percentage = LEAST(IF(v_total_active_records > 0, (v_clicked_count / v_total_active_records) * 100, 0), 999.99);
    SET v_sent_percentage = LEAST(IF(v_total_active_records > 0, (v_email_status_sent_count / v_total_active_records) * 100, 0), 999.99);

    -- Return the results
    SELECT v_campaignList AS campaignList, 
           v_email_status_active_count AS active_count, 
           v_email_status_sent_count AS sent_count, 
           v_email_status_in_queue_count AS in_queue_count, 
           v_total_contact_count AS total_contact, 
           v_today_contact_count AS today_contact,
           v_opened_count AS opened_count,
           v_clicked_count AS clicked_count,
           v_unopened_count AS unopened_count,
           v_bounce_count AS bounce_count,
           v_unsubscribe_count AS unsubscribe_count,
           FORMAT(v_open_percentage, 2) AS open_percentage,
           FORMAT(v_active_percentage, 2) AS active_percentage,
           FORMAT(v_clicked_percentage, 2) AS clicked_percentage,
           FORMAT(v_sent_percentage, 2) AS sent_percentage;
END