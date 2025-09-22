CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getEmailLogs`(p_cid text,p_campaign_id text,p_contact_id text,p_email_date text,p_scheduler_time text,p_email_status_id text)
BEGIN

    DECLARE offset_val INT;

  --  SET offset_val = (p_page_number - 1) * 10;

    SELECT 

    sch.scheduler_rule_id,
	date(sch.email_date) AS send_email_date,
     sch.company_id,
        sch.scheduler_time,

        sch.campaign_id,
        sender.email_id as sender_email,
        sch.cc,
        sch.bcc,
        camp.campaign_name,

        ruletemplte.campaign_subject as subject,

        ruletemplte.template_name as template_name,

        ruletemplte.template_description as template_description,

        ruledoc.document_name,

        ruledoc.document_description,

       ruledoc.is_password_protected,

        ruledoc.password_value,
        
        ruledoc.doc_format_id,
        
        ruledoc.doc_path_url,

        con.email as recipients_email,

        con.contact_detail,

        es.email_status,

        atcamp.attachment_name AS campaign_attachment_name,

         atcamp.attachment_type AS campaign_attachment_type,

         atcamp.attachment_path AS campaign_attachment_path,

 atchtemp.attachment_name as template_attachment_name,
         atchtemp.attachment_type as template_attachment_type,
         atchtemp.attachment_path as template_attachment_path
    FROM 

        tbl_email_scheduler_rule_for_campaign sch

    left JOIN 

        tbl_contact con ON con.contact_id = sch.contact_id AND con.is_active = 1

    left join tbl_campaign camp on  camp.campaign_id=sch.campaign_id and camp.is_active=1

    left JOIN 

        tbl_template temp ON temp.tem_id = camp.content_template_id AND temp.tem_is_active = 1

    left JOIN 

        tbl_email_status es ON es.email_status_id = sch.email_status_id AND es.is_active = 1

   left JOIN 

        tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id = sch.scheduler_rule_id AND ruletemplte.is_active = 1

   left JOIN 

        tbl_email_scedhuler_document_mapping ruledoc ON ruledoc.scheduler_rule_id = sch.scheduler_rule_id AND ruledoc.is_active = 1

    LEFT JOIN tbl_atchmt_campaign_mapping atcamp ON atcamp.campaign_id=camp.campaign_id AND atcamp.is_active=1

left join tbl_fromuser_campaign_mapping fromuser on fromuser.campaign_id=camp.campaign_id AND fromuser.is_active=1
 LEFT JOIN  tbl_mailbox sender ON sender.mailbox_id=fromuser.user_id AND sender.is_active=1
   left join tbl_atchmt_tmplt_mapping atchtemp on  atchtemp.template_id=camp.content_template_id And atchtemp.is_active=1

  WHERE 

 (sch.company_id=p_cid OR p_cid IS NULL OR p_cid='') And sch.is_active = 1
And (sch.contact_id=p_contact_id OR p_contact_id IS NULL OR p_contact_id='')
And (sch.email_date=p_email_date or p_email_date IS NULL OR p_email_date='')
And (sch.scheduler_time=p_scheduler_time or p_scheduler_time IS NULL OR p_scheduler_time='')
And (sch.campaign_id=p_campaign_id or p_campaign_id IS NULL OR p_campaign_id='')
And (sch.email_status_id=p_email_status_id or p_email_status_id IS NULL OR p_email_status_id='')
And sch.email_date < NOW() -- Filter out entries where the email date is before the current time

ORDER BY 
sch.scheduler_rule_id DESC;
-- LIMIT 
--   10 OFFSET offset_val;

END