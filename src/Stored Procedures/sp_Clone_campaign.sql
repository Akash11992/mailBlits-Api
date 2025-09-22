CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_Clone_campaign`(p_company_id INT, p_campaign_id INT)
BEGIN
    
    DECLARE v_campaign_name VARCHAR(255);
    DECLARE v_to_segment_id INT;
    DECLARE v_to_list_id INT;
    DECLARE v_from_user_id int;
    DECLARE v_subject longtext;
    DECLARE v_content_template_id INT;
    DECLARE v_send_immediately INT;
    DECLARE v_cc VARCHAR(255);
    DECLARE v_bcc VARCHAR(255);
    DECLARE v_is_active INT;
    DECLARE v_created_by int;
    DECLARE v_updated_by int;
DECLARE v_new_campaign_id INT;
 DECLARE v_is_emailTracking tinyint;
DECLARE v_is_neverExpire tinyint;
DECLARE v_is_approvalRequire tinyint;

		
    SELECT
        campaign_name,
        to_segment_id,
        to_list_id,
        from_user_id,
        content_template_id,
        send_immediately,
        cc,
        bcc,
        subject,
        is_active,
        created_by,
        is_emailTracking,
        is_neverExpire,
        is_approvalRequire
    INTO
        v_campaign_name,
        v_to_segment_id,
        v_to_list_id,
        v_from_user_id,
        v_content_template_id,
        v_send_immediately,
        v_cc,
        v_bcc,
        v_subject,
        v_is_active,
        v_created_by,
        v_is_emailTracking,
        v_is_neverExpire,
        v_is_approvalRequire
    FROM
        tbl_campaign
    WHERE
        campaign_id = p_campaign_id
        AND company_id = p_company_id;

    
        SET v_campaign_name = CONCAT(v_campaign_name, '_clone');
    
    IF v_campaign_name IS NOT NULL THEN        
        INSERT INTO tbl_campaign (
            campaign_name,
            company_id,
            to_segment_id,
            to_list_id,
            from_user_id,
            content_template_id,
            send_immediately,
            cc,
            bcc,
            subject,
            created_by,
            action,
            is_emailTracking,
        is_neverExpire,
        is_approvalRequire
        ) VALUES (
            v_campaign_name,
            p_company_id, 
            v_to_segment_id,
            v_to_list_id,
            v_from_user_id,
            v_content_template_id,
            v_send_immediately,
            v_cc,
            v_bcc,
            v_subject,
            v_created_by,
            'c',
            v_is_emailTracking,
        v_is_neverExpire,
        v_is_approvalRequire
        );

     --   SELECT LAST_INSERT_ID() AS new_campaign_id; 
     select campaign_id as new_campaign_id from tbl_campaign order by campaign_id desc limit 1;
    ELSE
        
        SELECT -1 AS new_campaign_id; 
    END IF;
END