CREATE  PROCEDURE `sp_GetEmailAnalytics`(IN p_cid INT, IN p_from_date TEXT, IN p_to_date TEXT, IN p_campaign_id TEXT)
BEGIN
    SELECT
        c.campaign_id,
        c.campaign_name,
        MIN(e.email_date) AS from_date,
        MAX(e.email_date) AS to_date,
        COUNT(CASE WHEN e.email_status_id = 2 THEN e.email_status_id END) AS sent_email_count,
        COUNT(CASE WHEN e.email_status_id = 3 THEN e.email_status_id END) AS failed_email_count,
		COUNT(CASE WHEN e.email_status_id = 4 THEN e.email_status_id END) AS inqueue_email_count,
        COUNT(CASE WHEN e.email_status_id = 6 THEN e.email_status_id END) AS bounce_email_count,
		COUNT(CASE WHEN e.user_status_id = 1 THEN e.user_status_id END) AS open_count,
		COUNT(CASE WHEN e.user_status_id = 5 THEN e.user_status_id END) AS failure_delivery_count,
		COUNT(CASE WHEN e.user_status_id = 3 THEN e.user_status_id END) AS under_process_count,
		COUNT(CASE WHEN e.user_status_id = 4 THEN e.user_status_id END) AS unopened_count,

       e.scheduler_rule_id
    FROM
        tbl_email_scheduler_rule_for_campaign e
        JOIN tbl_campaign c ON c.campaign_id = e.campaign_id
    WHERE
        e.company_id = p_cid
        AND (p_from_date = '' OR p_to_date = '' OR e.email_date BETWEEN p_from_date AND p_to_date)
           AND (p_campaign_id = ''  OR c.campaign_id=p_campaign_id)

   GROUP BY
        e.campaign_id,
        e.user_status_id,
        e.email_status_id;
END