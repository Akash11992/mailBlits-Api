CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_email_scheduler_rule_for_campaign_OnSendImmediately`(p_company_id INT, IN p_campaign_name VARCHAR(200), p_list_id INT, p_is_send_immediately TINYINT,p_user_id int,p_from_user_id int,p_cc text,p_bcc text,p_isEmailTrackingEnabled TINYINT)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE p_contact_id INT;
	DECLARE p_campaign_id INT;
	DECLARE p_schedule_id int;

    DECLARE cur CURSOR FOR
        SELECT contact_id FROM tbl_contact_list_mapping WHERE company_id = p_company_id AND list_id = p_list_id AND is_active = 1;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

   
        SELECT campaign_id INTO p_campaign_id
        FROM tbl_campaign
        WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND  action !='d';
        
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO p_contact_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        IF p_is_send_immediately = 1 THEN
            INSERT INTO tbl_email_scheduler_rule_for_campaign(company_id, campaign_id, contact_id, is_send_immediately,email_status_id, email_date,created_by,scheduler_time,user_status_id,from_user_id,cc,bcc,isEmailTrackingEnabled,action)
            VALUES (p_company_id, p_campaign_id, p_contact_id, p_is_send_immediately,1, curdate(),p_user_id,curtime(),3,p_from_user_id,p_cc,p_bcc,p_isEmailTrackingEnabled,'c');
   	   
   --     SET p_schedule_id = LAST_INSERT_ID();
	-- Fetch the last inserted ID directly by ordering by the primary key
            SELECT scheduler_rule_id INTO p_schedule_id
            FROM tbl_email_scheduler_rule_for_campaign
            ORDER BY scheduler_rule_id DESC
            LIMIT 1;
	SELECT "success24" AS response, p_schedule_id AS schedule_id; 

   END IF;
    END LOOP;
    CLOSE cur;
END