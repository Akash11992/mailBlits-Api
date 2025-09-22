CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_ModuleWise_AuditReports`(
    IN module_id INT,
    IN user_id INT,
    IN company_id INT,
    IN p_role VARCHAR(100),
    IN fromDate DATETIME,
    IN toDate DATETIME
)
BEGIN
    DECLARE ROLE VARCHAR(100);

    -- Common check for company_id
    DECLARE company_check VARCHAR(100);
    SET company_check = (SELECT cr.company_id FROM mailblitzuat.tbl_company_registration cr WHERE cr.company_id = company_id);

    IF (module_id = 1) THEN
        SELECT * FROM (
            SELECT 
                cam.campaign_name AS Campaign_name,
                cr.company_name AS Company,
                seg.segments_name AS Segment_name,
                lis.list_name AS ListName,
                mail.email_id AS From_User,
                temp.template_name AS template_Name,
                CASE WHEN cam.send_immediately = 1 THEN 'Yes' ELSE 'No' END AS Send_Immediately,
                cam.cc AS CC,
                cam.bcc AS BCC,
                cam.subject AS Subject,
                CASE WHEN cam.is_emailTracking = 1 THEN 'Yes' ELSE 'No' END AS Email_Tracking,
                CASE WHEN cam.is_neverExpire = 1 THEN 'Yes' ELSE 'No' END AS NeverExpire,
                CASE WHEN cam.is_approvalRequire = 1 THEN 'Yes' ELSE 'No' END AS Approval_Require,
                CASE WHEN cam.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                cam.action,
                ru.full_name AS Created_by,
                cam.created_at 
            FROM 
                mailblitzuat.tbl_campaign cam
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON cam.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_segments seg ON cam.to_segment_id = seg.segments_id
            LEFT JOIN 
                mailblitzuat.tbl_list lis ON cam.to_list_id = lis.list_id
            LEFT JOIN 
                mailblitzuat.tbl_mailbox mail ON cam.from_user_id = mail.mailbox_id
            LEFT JOIN 
                mailblitzuat.tbl_template temp ON cam.content_template_id = temp.template_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON cam.created_by = ru.user_id
            WHERE
                cam.company_id = company_check  
                AND cam.is_active = 1
                AND (ROLE = p_role OR cam.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (cam.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT 
                caml.campaign_name AS Campaign_name,
                cr.company_name AS Company,
                seg.segments_name AS Segment_name,
                lis.list_name AS ListName,
                mail.email_id AS From_User,
                temp.template_name AS template_Name,
                CASE WHEN caml.send_immediately = 1 THEN 'Yes' ELSE 'No' END AS Send_Immediately,
                caml.cc AS CC,
                caml.bcc AS BCC,
                caml.subject AS Subject,
                CASE WHEN caml.is_emailTracking = 1 THEN 'Yes' ELSE 'No' END AS Email_Tracking,
                CASE WHEN caml.is_neverExpire = 1 THEN 'Yes' ELSE 'No' END AS NeverExpire,
                CASE WHEN caml.is_approvalRequire = 1 THEN 'Yes' ELSE 'No' END AS Approval_Require,
                CASE WHEN caml.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                caml.action,
                ru.full_name AS Created_by,
                caml.created_at 
            FROM 
                mailblitzuat_logs.tbl_campaign_logs caml
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON caml.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_segments seg ON caml.to_segment_id = seg.segments_id
            LEFT JOIN 
                mailblitzuat.tbl_list lis ON caml.to_list_id = lis.list_id
            LEFT JOIN 
                mailblitzuat.tbl_mailbox mail ON caml.from_user_id = mail.mailbox_id
            LEFT JOIN 
                mailblitzuat.tbl_template temp ON caml.content_template_id = temp.template_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON caml.created_by = ru.user_id 
            WHERE
                caml.company_id = company_check  
                AND caml.is_active = 1
                AND (ROLE = p_role OR caml.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (caml.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            Campaign_name DESC;

    ELSEIF (module_id = 2) THEN
        SELECT * FROM (
            SELECT 
                temp.template_name AS Template_name,
                cr.company_name AS Company,
                CASE WHEN temp.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                temp.action AS Action,
                ru.full_name AS Created_by,
                temp.created_at
            FROM 
                mailblitzuat.tbl_template temp
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON temp.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON temp.created_by = ru.user_id
            WHERE
                temp.company_id = company_check  
                AND temp.is_active = 1
                AND (ROLE = p_role OR temp.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (temp.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT
                templ.template_name AS Template_name,
                cr.company_name AS Company,
                CASE WHEN templ.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                templ.action AS Action,
                ru.full_name AS Created_by,
                templ.created_at
            FROM 
                mailblitzuat_logs.tbl_template_logs templ
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON templ.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON templ.created_by = ru.user_id
            WHERE
                templ.company_id = company_check  
                AND templ.is_active = 1
                AND (ROLE = p_role OR templ.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (templ.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            Template_name DESC;
        
    ELSEIF (module_id = 3) THEN
        SELECT * FROM (
            SELECT 
                cr.company_name AS Company,
                con.email AS Email,
                -- con.alternate_email AS Alternate_Email,
                CASE WHEN con.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                con.action AS Action,
                ru.full_name AS Created_by,
                con.created_at
            FROM 
                mailblitzuat.tbl_contact con
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON con.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON con.created_by = ru.user_id
            WHERE
                con.company_id = company_check  
                AND con.is_active = 1  
                AND (ROLE = p_role OR con.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (con.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT 
                cr.company_name AS Company,
                conl.email AS Email,
                -- conl.alternate_email AS Alternate_Email,
                CASE WHEN conl.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                conl.action AS Action,
                ru.full_name AS Created_by,
                conl.created_at
            FROM 
                mailblitzuat_logs.tbl_contact_logs conl
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON conl.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON conl.created_by = ru.user_id
            WHERE
                conl.company_id = company_check  
                AND conl.is_active = 1  
                AND (ROLE = p_role OR conl.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (conl.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            Email DESC;
    
    ELSEIF (module_id = 4) THEN
        SELECT * FROM (
            SELECT 
                seg.segments_name AS Segment_name,
                cr.company_name AS Company,
                JSON_UNQUOTE(seg.Criteria) AS Criteria,
                CASE WHEN seg.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                seg.action AS Action,
                ru.full_name AS Created_by,
                seg.created_at
            FROM 
                mailblitzuat.tbl_segments seg
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON seg.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON seg.created_by = ru.user_id
            WHERE
                seg.company_id = company_check  
                AND seg.is_active = 1  
                AND (ROLE = p_role OR seg.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (seg.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT 
                segl.segments_name AS Segment_name,
                cr.company_name AS Company,
                JSON_UNQUOTE(segl.Criteria) AS Criteria,
                CASE WHEN segl.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                segl.action AS Action,
                ru.full_name AS Created_by,
                segl.created_at
            FROM 
                mailblitzuat_logs.tbl_segments_logs segl
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON segl.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON segl.created_by = ru.user_id
            WHERE
                segl.company_id = company_check  
                AND segl.is_active = 1  
                AND (ROLE = p_role OR segl.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (segl.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            Segment_name DESC;
    
    ELSEIF (module_id = 5) THEN
        SELECT * FROM (
            SELECT 
                lis.list_name AS List_name,
                cr.company_name AS Company,
                CASE WHEN lis.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                lis.action AS Action,
                ru.full_name AS Created_by,
                lis.created_at
            FROM 
                mailblitzuat.tbl_list lis
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON lis.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON lis.created_by = ru.user_id
            WHERE
                lis.company_id = company_check  
                AND lis.is_active = 1  
                AND (ROLE = p_role OR lis.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (lis.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT 
                lisl.list_name AS List_name,
                cr.company_name AS Company,
                CASE WHEN lisl.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                lisl.action AS Action,
                ru.full_name AS Created_by,
                lisl.created_at
            FROM 
                mailblitzuat_logs.tbl_list_logs lisl
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON lisl.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON lisl.created_by = ru.user_id
            WHERE
                lisl.company_id = company_check  
                AND lisl.is_active = 1  
                AND (ROLE = p_role OR lisl.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (lisl.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            List_name DESC;
    
    ELSEIF (module_id = 7) THEN
        SELECT * FROM (
            SELECT 
                u.full_name AS User_Name,
                cr.company_name AS Company,
                CASE WHEN u.is_email_verified = 1 THEN 'Yes' ELSE 'No' END AS Is_Email_Verified,
                CASE WHEN u.is_admin_approval = 1 THEN 'Yes' ELSE 'No' END AS Is_Admin_Approved,
                CASE WHEN u.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                u.action AS Action,
                ru.full_name AS Created_by,
                u.created_at
            FROM 
                mailblitzuat.tbl_users u
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON u.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON u.created_by = ru.user_id
            WHERE
                u.company_id = company_check  
                AND (ROLE = p_role OR u.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (u.created_at BETWEEN fromDate AND toDate))
            UNION ALL
            SELECT 
                ul.full_name AS User_Name,
                cr.company_name AS Company,
                CASE WHEN ul.is_email_verified = 1 THEN 'Yes' ELSE 'No' END AS Is_Email_Verified,
                CASE WHEN ul.is_admin_approval = 1 THEN 'Yes' ELSE 'No' END AS Is_Admin_Approved,
                CASE WHEN ul.is_active = 1 THEN 'True' ELSE 'False' END AS Is_Active,
                ul.action AS Action,
                ru.full_name AS Created_by,
                ul.created_at
            FROM 
                mailblitzuat_logs.tbl_users_logs ul
            LEFT JOIN 
                mailblitzuat.tbl_company_registration cr ON ul.company_id = cr.company_id
            LEFT JOIN 
                mailblitzuat.tbl_users ru ON ul.created_by = ru.user_id
            WHERE
                ul.company_id = company_check  
                AND (ROLE = p_role OR ul.created_by = user_id)
                AND ((fromDate IS NULL AND toDate IS NULL) OR (ul.created_at BETWEEN fromDate AND toDate))
        ) AS combined_results
        ORDER BY 
            User_Name DESC;
    END IF;
END