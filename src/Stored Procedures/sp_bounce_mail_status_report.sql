CREATE  PROCEDURE `sp_bounce_mail_status_report`(p_company_id INT, from_date TEXT, to_date TEXT,p_campaign_id text)
BEGIN
    SELECT sr.campaign_id, camp.campaign_name, sr.scheduler_rule_id, sr.company_id, 
           be.ToEmailID AS `to`, be.email_bouncetime  , sr.email_date as sentdate, 
           ruletemplte.template_description as body, ruletemplte.campaign_subject as subject, 
           be.email_status
    FROM tbl_email_scheduler_rule_for_campaign sr
    LEFT JOIN tblbouceemaildetails be ON be.scheduler_rule_id = sr.scheduler_rule_id
    LEFT JOIN tbl_email_scedhuler_template_mapping ruletemplte ON ruletemplte.scheduler_rule_id = sr.scheduler_rule_id
    LEFT JOIN tbl_campaign camp ON camp.campaign_id = sr.campaign_id 
    WHERE sr.company_id = p_company_id
      AND sr.email_status_id = 6
      AND be.email_bouncetime IS NOT NULL
      AND ((from_date = '' OR to_date = '') OR 
              (sr.email_date >= from_date
             AND sr.email_date <= to_date))
	AND (p_campaign_id = ''  OR sr.campaign_id=p_campaign_id)
       
    ;
END