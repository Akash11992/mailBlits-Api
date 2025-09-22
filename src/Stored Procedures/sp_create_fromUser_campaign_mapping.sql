CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_fromUser_campaign_mapping`(
    IN p_company_id INT,
        IN p_campaign_name VARCHAR(200),
    IN p_user_id int,
    IN p_created_by VARCHAR(45)
)
BEGIN
    DECLARE previous_id INT;
    DECLARE new_id INT;
    DECLARE p_campaign_id INT;

        
        SELECT campaign_id INTO p_campaign_id
        FROM tbl_campaign
        WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND  action !='d';

      /*  
        IF (SELECT MAX(user_cmpn_mapping_id) FROM tbl_fromuser_campaign_mapping) > 0 THEN
            SELECT MAX(user_cmpn_mapping_id) INTO previous_id FROM tbl_fromuser_campaign_mapping;
            SET new_id = previous_id + 1;
        ELSE
            SET new_id = 1;
        END IF;
*/
        
        INSERT INTO tbl_fromuser_campaign_mapping (
          
            company_id,
            campaign_id,
            user_id,
            action,
            is_active,
            created_by
        )
        VALUES (
         
            p_company_id,
            p_campaign_id,
            p_user_id,
            'c',
            1,
            p_created_by
        );

        SELECT "success" AS response;
   
END