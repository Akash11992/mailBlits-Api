CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_days_campaign_mapping`(

    IN p_company_id INT,

    IN p_campaign_name VARCHAR(200),

     IN p_day_id int,
in p_is_active int,
    IN p_created_by VARCHAR(45)

)
BEGIN

    DECLARE previous_id INT;

    DECLARE new_id INT;

    DECLARE p_campaign_id INT;
 
        -- Get the newly inserted template ID

        SELECT campaign_id INTO p_campaign_id

        FROM tbl_campaign

        WHERE campaign_name = p_campaign_name AND company_id = p_company_id AND is_active = 1;
 
        -- Generate a new document mapping ID

        IF (SELECT MAX(day_campn_id) FROM tbl_days_campaign_mapping) > 0 THEN

            SELECT MAX(day_campn_id) INTO previous_id FROM tbl_days_campaign_mapping;

            SET new_id = previous_id + 1;

        ELSE

            SET new_id = 1;

        END IF;
 
        -- Insert into document template mapping table

        INSERT INTO tbl_days_campaign_mapping (

            day_campn_id,

            company_id,

            campaign_id,

            day_id,

            is_active,

            created_by,

            updated_by

        )

        VALUES (

            new_id,

            p_company_id,

            p_campaign_id,

            p_day_id,

            p_is_active,

            p_created_by,

            p_created_by

        );
 
        SELECT "success" AS response;

END