CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_sent_mail_status_report`(p_company_id INT, from_date TEXT, to_date TEXT , p_campaign_id text)
BEGIN
    SELECT sr.campaign_id,camp.campaign_name,sr.scheduler_rule_id,sr.company_id,se.ToEmailID AS `to`, se.sender_email AS `from`, se.mail_send_time , ruletemplte.template_description as body ,ruletemplte.campaign_subject as subject,se.email_status,
    atcamp.attachment_name AS campaign_attachment_name,
        atcamp.attachment_type AS campaign_attachment_type,
        atcamp.attachment_path AS campaign_attachment_path,
        atchtemp.attachment_name AS template_attachment_name,
        atchtemp.attachment_type AS template_attachment_type,
        atchtemp.attachment_path AS template_attachment_path,
         ruledoc.document_name,
        ruledoc.document_description,
        ruledoc.is_password_protected,
        ruledoc.password_value,
        df.doc_format_typ,
        ruledoc.doc_path_url
    FROM tbl_email_scheduler_rule_for_campaign sr
    LEFT JOIN tblemailsentlogs se ON se.scheduler_rule_id = sr.scheduler_rule_id and se.email_status="Sent" and sr.email_status_id=2
    Left join tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id=sr.scheduler_rule_id
	Left join tbl_email_scedhuler_document_mapping sdm ON sdm.scheduler_rule_id=sr.scheduler_rule_id
       Left join   tbl_campaign camp ON camp.campaign_id = sr.campaign_id 
      left join tbl_atchmt_tmplt_mapping atchtemp on  atchtemp.template_id=camp.content_template_id 
       left join   tbl_atchmt_campaign_mapping atcamp ON atcamp.campaign_id = sr.campaign_id 
       left join tbl_email_scedhuler_document_mapping ruledoc ON ruledoc.scheduler_rule_id = sr.scheduler_rule_id 
left join tbl_doc_format df on ruledoc.doc_format_id=df.doc_format_id
    WHERE sr.company_id = p_company_id
   
   AND ((from_date = '' OR to_date = '') OR 
              (sr.email_date >= from_date
             AND sr.email_date <= to_date))
             
      
--              AND (from_date = '' OR to_date = '' OR sr.email_date BETWEEN from_date AND to_date)

      AND (p_campaign_id = ''  OR sr.campaign_id=p_campaign_id)
       
And sr.email_status_id=2
And se.mail_send_time is not null
;
END