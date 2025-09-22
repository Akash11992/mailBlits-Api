CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getAllSchedulerDetailsByCid`(

    p_company_id INT,

    p_status_id VARCHAR(255),

    p_page_number INT,

    p_page_size INT,

p_campaign_id INT

)
BEGIN

    DECLARE offset_val INT;

    SET offset_val = (p_page_number - 1) * p_page_size;


    SELECT COUNT(*) INTO @total_records

    FROM tbl_email_scheduler_rule_for_campaign

     WHERE 

        company_id = p_company_id AND is_active = 1
 
        AND FIND_IN_SET(email_status_id, p_status_id) > 0;


    SELECT COUNT(distinct sch.scheduler_rule_id) INTO @filtered_records

    FROM 

        tbl_email_scheduler_rule_for_campaign sch

    LEFT JOIN 

        tbl_contact con ON con.company_id = p_company_id AND con.contact_id = sch.contact_id AND con.is_active = 1

    LEFT JOIN 

        tbl_campaign camp ON camp.company_id = p_company_id AND camp.campaign_id = sch.campaign_id AND camp.is_active = 1

    LEFT JOIN 

        tbl_template temp ON temp.company_id = p_company_id AND temp.template_id = camp.content_template_id AND temp.is_active = 1

    LEFT JOIN 

        tbl_email_status es ON es.email_status_id = sch.email_status_id AND es.is_active = 1

    LEFT JOIN 

        tbl_fromuser_campaign_mapping fromuser ON fromuser.campaign_id = camp.campaign_id AND fromuser.is_active = 1

    LEFT JOIN 

        tbl_mailbox sender ON sender.mailbox_id = fromuser.mailbox_id AND sender.is_active = 1

    LEFT JOIN 

        tbl_email_scedhuler_document_mapping ruledoc ON ruledoc.scheduler_rule_id = sch.scheduler_rule_id AND ruledoc.is_active = 1

    LEFT JOIN 

        tbl_attachment_campaign_mapping atcamp ON atcamp.campaign_id = camp.campaign_id AND atcamp.is_active = 1

    LEFT JOIN 

        tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id = sch.scheduler_rule_id AND ruletemplte.is_active = 1

    LEFT JOIN 

        tbl_attachment_template_mapping atchtemp ON atchtemp.company_id = p_company_id AND atchtemp.template_id = camp.content_template_id AND atchtemp.is_active = 1

    WHERE 

        sch.company_id = p_company_id AND sch.is_active = 1

        AND FIND_IN_SET(sch.email_status_id, p_status_id) > 0

        AND camp.is_active = 1

		AND (p_campaign_id IS NULL OR sch.campaign_id=p_campaign_id)

        ORDER BY 

        sch.scheduler_rule_id DESC;

  --  LIMIT p_page_size OFFSET offset_val;
 
    
    WITH tmp_tbl_email_scheduler_rule_for_campaign AS (
        select * from tbl_email_scheduler_rule_for_campaign 
        where company_id = 1 AND is_active = 1 AND FIND_IN_SET(email_status_id, p_status_id) > 0 AND (p_campaign_id IS NULL OR campaign_id=p_campaign_id)
        LIMIT p_page_size OFFSET offset_val
    )
    SELECT 

        sch.company_id,

        sch.scheduler_rule_id,

        DATE(sch.email_date) AS send_email_date,

        sch.scheduler_time,

        sch.campaign_id,

        max(sender.email_id) AS sender_email,

        sch.cc,

        sch.bcc,

        camp.campaign_name,

        max(ruletemplte.campaign_subject) AS subject,

        max(ruletemplte.template_name) AS template_name,

        max(ruletemplte.template_description) AS description,

        con.email AS recipients_email,

        con.contact_detail,

        es.email_status,

      --  max(ruledoc.document_name),

      --  max(ruledoc.document_description),

       -- max(ruledoc.is_password_protected),

       -- max(ruledoc.password_value),

      --  max(ruledoc.doc_format_id),

       -- max(ruledoc.doc_path_url),

       GROUP_CONCAT(DISTINCT ruledoc.document_name SEPARATOR ', ') as document_name ,

    GROUP_CONCAT(DISTINCT ruledoc.document_description SEPARATOR ', ') as document_description,

    GROUP_CONCAT(DISTINCT ruledoc.is_password_protected SEPARATOR ', ') as is_password_protected,

   -- GROUP_CONCAT(DISTINCT ruledoc.password_value SEPARATOR ', ') as password_value,
GROUP_CONCAT(DISTINCT CASE WHEN ruledoc.password_value IS NOT NULL AND ruledoc.password_value != '' 
            THEN ruledoc.password_value 
            ELSE NULL 
        END SEPARATOR ', ') AS password_value,
    GROUP_CONCAT(DISTINCT ruledoc.doc_format_id SEPARATOR ', ')as doc_format_id,

 --   GROUP_CONCAT(DISTINCT ruledoc.doc_path_url SEPARATOR '')as doc_path_url,
	GROUP_CONCAT(DISTINCT CASE WHEN ruledoc.doc_path_url IS NOT NULL AND ruledoc.doc_path_url != '' 
            THEN ruledoc.doc_path_url 
            ELSE NULL 
        END SEPARATOR ', ') AS doc_path_url,

/*	GROUP_CONCAT(DISTINCT atcamp.attachment_name SEPARATOR ', ') AS campaign_attachment_name,

		GROUP_CONCAT(DISTINCT atcamp.attachment_type  SEPARATOR ', ') AS campaign_attachment_type,

		GROUP_CONCAT(DISTINCT atcamp.attachment_path SEPARATOR ', ') AS campaign_attachment_path,

		GROUP_CONCAT(DISTINCT atchtemp.attachment_name  SEPARATOR ', ') AS template_attachment_name,

		GROUP_CONCAT(DISTINCT atchtemp.attachment_type  SEPARATOR ', ') AS template_attachment_type,

		GROUP_CONCAT(DISTINCT atchtemp.attachment_path  SEPARATOR ', ') AS template_attachment_path,
 */
       atcamp.attachment_name AS campaign_attachment_name,

        atcamp.attachment_type AS campaign_attachment_type,

        atcamp.attachment_path AS campaign_attachment_path,

        atchtemp.attachment_name AS template_attachment_name,

        atchtemp.attachment_type AS template_attachment_type,

        atchtemp.attachment_path AS template_attachment_path,

        @total_records AS total_records,

        @filtered_records AS filtered_records

    FROM 

        tmp_tbl_email_scheduler_rule_for_campaign sch

    LEFT JOIN 

        tbl_contact con ON con.company_id = p_company_id AND con.contact_id = sch.contact_id AND con.is_active = 1

    LEFT JOIN 

        tbl_campaign camp ON camp.company_id = p_company_id AND camp.campaign_id = sch.campaign_id AND camp.is_active = 1

    LEFT JOIN 

        tbl_template temp ON temp.company_id = p_company_id AND temp.template_id = camp.content_template_id AND temp.is_active = 1

    LEFT JOIN 

        tbl_email_status es ON es.email_status_id = sch.email_status_id AND es.is_active = 1

    LEFT JOIN 

        tbl_fromuser_campaign_mapping fromuser ON fromuser.campaign_id = camp.campaign_id AND fromuser.is_active = 1

    LEFT JOIN 

        tbl_mailbox sender ON sender.mailbox_id = fromuser.mailbox_id AND sender.is_active = 1

    LEFT JOIN 

        tbl_email_scedhuler_document_mapping ruledoc ON ruledoc.scheduler_rule_id = sch.scheduler_rule_id AND ruledoc.is_active = 1

    LEFT JOIN 

        tbl_attachment_campaign_mapping atcamp ON atcamp.campaign_id = camp.campaign_id AND atcamp.is_active = 1

    LEFT JOIN 

        tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id = sch.scheduler_rule_id AND ruletemplte.is_active = 1

    LEFT JOIN 

        tbl_attachment_template_mapping atchtemp ON atchtemp.company_id = p_company_id AND atchtemp.template_id = camp.content_template_id AND atchtemp.is_active = 1

    WHERE camp.is_active = 1

GROUP BY 

        sch.scheduler_rule_id, 

        sch.company_id,
        -- added
        atcamp.attachment_name,
atcamp.attachment_type,

atcamp.attachment_path ,

atchtemp.attachment_name ,

atchtemp.attachment_type,

 atchtemp.attachment_path
-- 
    ORDER BY 

        sch.scheduler_rule_id DESC;

END