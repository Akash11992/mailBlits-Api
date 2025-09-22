CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_campaign`(p_company_id INT)
BEGIN
    DECLARE cidexist INT;
    
    
    SELECT COUNT(company_id) INTO cidexist 
    FROM tbl_campaign 
    WHERE company_id = p_company_id  and `action`!='d';
    
    IF cidexist > 0 THEN
        
        SELECT 
            c.campaign_id, 
            c.company_id, 
            c.campaign_name, 
            c.is_active, 
            c.created_at, 
            max(u.full_name) AS created_by,
            COUNT(CASE WHEN e.email_status_id = 1 And e.is_active=1 THEN e.email_status_id END) AS active_email_count,
            COUNT(CASE WHEN e.email_status_id = 2 And e.is_active=1 THEN e.email_status_id  END) AS sent_email_count,
            COUNT(CASE WHEN e.email_status_id = 3 And e.is_active=1 THEN e.email_status_id  END) AS failed_email_count,
            COUNT(CASE WHEN e.email_status_id = 4 And e.is_active=1 THEN e.email_status_id  END) AS inqueue_email_count,
            COUNT(CASE WHEN e.email_status_id = 6 And e.is_active=1 THEN e.email_status_id  END) AS bounce_email_count,
            COUNT(CASE WHEN e.user_status_id = 1 And e.is_active=1 THEN e.user_status_id  END) AS open_count,
            COUNT(CASE WHEN e.user_status_id = 5 And e.is_active=1 THEN e.user_status_id END) AS failure_delivery_count,
            COUNT(CASE WHEN e.user_status_id = 3 And e.is_active=1 THEN e.user_status_id  END) AS under_process_count,
            COUNT(CASE WHEN e.user_status_id = 4 And e.is_active=1 THEN e.user_status_id END) AS unopened_count,
            COUNT(e.contact_id) AS contact_id_count,
            COUNT(CASE WHEN e.is_active=0 THEN e.contact_id  END) AS pending_approval_count
           
        FROM tbl_campaign c
		JOIN tbl_email_scheduler_rule_for_campaign e ON c.campaign_id = e.campaign_id AND e.company_id = p_company_id and  e.action!='d'
        INNER JOIN tbl_users u ON u.user_id = c.created_by and u.is_active=1
        join tbl_contact con on con.contact_id=e.contact_id  and con.company_id = p_company_id and con.action!='d' and con.is_active=1
        WHERE c.company_id = p_company_id  and c.`action`!='d' 
        GROUP BY e.campaign_id ,e.is_active
        ORDER BY c.created_at DESC;  

        
        SELECT COUNT(*) AS count 
        FROM tbl_campaign 
        WHERE company_id = p_company_id and `action`!='d';
    ELSE
        
        SELECT "fail" AS response;
    END IF;
END