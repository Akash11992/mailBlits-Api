CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_schedule_campaign_mapping`(
    IN p_company_id INT,
        IN p_campaign_name VARCHAR(200),
    IN p_schedule_date date,
        IN p_schedule_time time,
            IN p_schedulule_timezone varchar(200),
                IN p_schedule_daily_limit int,
    IN p_created_by VARCHAR(45)
)
BEGIN
    DECLARE previous_id INT;
    DECLARE new_id INT;
    DECLARE p_campaign_id INT;

        
        SELECT campaign_id INTO p_campaign_id
        FROM tbl_campaign
        WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND action !='d';

   /*     
        IF (SELECT MAX(schedule_campn_id) FROM tbl_schedule_campaign_mapping) > 0 THEN
            SELECT MAX(schedule_campn_id) INTO previous_id FROM tbl_schedule_campaign_mapping;
            SET new_id = previous_id + 1;
        ELSE
            SET new_id = 1;
        END IF;
*/
        
        INSERT INTO tbl_schedule_campaign_mapping (
		
            company_id,
            campaign_id,
            schedule_date,
            schedule_time,
            schedule_timezone_id,
            schedule_daily_limit,
            action,
            is_active,
            created_by
         
        )
        VALUES (
          
            p_company_id,
            p_campaign_id,
            p_schedule_date,
            p_schedule_time,
            p_schedulule_timezone,
            p_schedule_daily_limit,
            'c',
            1,
            p_created_by
          
        );

        SELECT "success" AS response;
   
END