CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getAllSchedulerDetailsByCid_forSendingEmail`(p_status_id VARCHAR(255))
BEGIN
    DECLARE offset_val INT;

    SELECT 
        sch.scheduler_rule_id,
        DATE(sch.email_date) AS send_email_date,
        sch.company_id,
        sch.scheduler_time AS scheduler_time,
        provider.email_provider_name AS providerName,
        provider.email_provider_id AS providerId,
        sch.cc,
        sch.bcc,
        sch.campaign_id,
        sch.isEmailTrackingEnabled,
        camp.campaign_name,
        ruletemplte.campaign_subject as subject,
        ruletemplte.template_name AS template_name,
        ruletemplte.template_description AS template_description,
        temp.add_unsubscribe,
        ruledoc.document_name,
        ruledoc.document_description,
        ruledoc.is_password_protected,
        ruledoc.password_value,
        ruledoc.doc_format_id,
        ruledoc.doc_path_url,
        con.email AS recipients_email,
        con.contact_detail,
        es.email_status,
        atcamp.attachment_name AS campaign_attachment_name,
        atcamp.attachment_type AS campaign_attachment_type,
        atcamp.attachment_path AS campaign_attachment_path,
        atchtemp.attachment_name AS template_attachment_name,
        atchtemp.attachment_type AS template_attachment_type,
        atchtemp.attachment_path AS template_attachment_path,
		sender.email_id AS sender_email,
        sender.oAuth_payload AS oauthPayload
		
    FROM 
        tbl_email_scheduler_rule_for_campaign sch
    LEFT JOIN 
        tbl_contact con ON con.contact_id = sch.contact_id AND con.is_active = 1
    LEFT JOIN 
        tbl_campaign camp ON camp.campaign_id = sch.campaign_id AND camp.is_active = 1
    LEFT JOIN 
        tbl_template temp ON temp.template_id = camp.content_template_id AND temp.is_active = 1
    LEFT JOIN 
        tbl_email_status es ON es.email_status_id = sch.email_status_id AND es.is_active = 1
    LEFT JOIN 
        tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id = sch.scheduler_rule_id AND ruletemplte.is_active = 1
    LEFT JOIN 
        tbl_email_scedhuler_document_mapping ruledoc ON ruledoc.scheduler_rule_id = sch.scheduler_rule_id AND ruledoc.is_active = 1
    LEFT JOIN 
        tbl_attachment_campaign_mapping atcamp ON atcamp.campaign_id = camp.campaign_id AND atcamp.is_active = 1
    LEFT JOIN 
        tbl_fromuser_campaign_mapping fromuser ON fromuser.campaign_id = camp.campaign_id AND fromuser.is_active = 1
    LEFT JOIN  
        tbl_mailbox sender ON sender.mailbox_id = fromuser.mailbox_id AND sender.is_active = 1
	LEFT JOIN  
		tbl_email_provider provider ON provider.email_provider_id = sender.provider_id AND provider.is_active = 1
  -- left join
   		-- tbl_protocol_type protocol ON protocol.protocol_id = sender.protocol_id AND protocol.is_active = 1

   left join 
        tbl_attachment_template_mapping atchtemp on  atchtemp.template_id=camp.content_template_id And atchtemp.is_active=1

   WHERE 
        sch.is_active = 1 and sch.action!='d'
        AND (FIND_IN_SET(sch.email_status_id, p_status_id) > 0 OR p_status_id IS NULL OR p_status_id = '')
        AND sch.email_date < NOW()
    ORDER BY 
        sch.scheduler_rule_id DESC
        LIMIT 50;

    IF FIND_IN_SET('1', p_status_id) > 0 THEN
        UPDATE tbl_email_scheduler_rule_for_campaign
        SET email_status_id = 4
        WHERE 
            is_active = 1
            AND FIND_IN_SET(email_status_id, p_status_id) > 0
            AND email_date < NOW();
    END IF;

END