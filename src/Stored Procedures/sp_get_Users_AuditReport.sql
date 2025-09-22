CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_Users_AuditReport`(
    IN module_id INT,
    IN fromDate DATETIME,
    IN toDate DATETIME
)
BEGIN
    IF (module_id = 1) THEN
        SELECT 
            cam.campaign_name AS Campaign_name,
            cr.company_name AS Company, -- Get company name directly
            seg.segments_name AS Segment_name,
            lis.list_name AS ListName,
            mail.email_id AS From_User,
            temp.template_name AS template_Name,
			CASE 
                WHEN cam.send_immediately = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Send_Immediately,
            cam.cc AS CC,
            cam.bcc AS BCC,
            cam.subject AS Subject,
            CASE 
                WHEN cam.is_emailTracking = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Email_Tracking,
            CASE 
                WHEN cam.is_neverExpire = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS NeverExpire,
            CASE 
                WHEN cam.is_approvalRequire = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Approval_Require,
            CASE 
                WHEN cam.is_active = 1 THEN 'True' 
                ELSE 'False' 
            END AS Is_Active,
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
        UNION ALL
        
        SELECT 
            caml.campaign_name AS Campaign_name,
            cr.company_name AS Company, -- Get company name directly
            seg.segments_name AS Segment_name,
            lis.list_name AS ListName,
            mail.email_id AS From_User,
            temp.template_name AS template_Name,
            CASE 
                WHEN caml.send_immediately = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Send_Immediately,
            caml.cc AS CC,
            caml.bcc AS BCC,
            caml.subject AS Subject,
            CASE 
                WHEN caml.is_emailTracking = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Email_Tracking,
            CASE 
                WHEN caml.is_neverExpire = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS NeverExpire,
            CASE 
                WHEN caml.is_approvalRequire = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Approval_Require,
            CASE 
                WHEN caml.is_active = 1 THEN 'True' 
                ELSE 'False' 
            END AS Is_Active,
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
            (fromDate IS NULL AND toDate IS NULL) OR
            (caml.created_at BETWEEN fromDate AND toDate)
        ORDER BY 
            created_at;

    END IF;

    IF (module_id = 7) THEN

        SELECT 
            ru.full_name AS Name, 
            ru.email AS Email, 
            dm.dm_name AS Designation, 
            rm.role_name AS Role,
            ru.phone_number AS Phone_Number,
            CASE 
                WHEN ru.is_individual = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS is_individual,
            CASE 
                WHEN ru.is_email_verified = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS is_email_verified,
            CASE 
                WHEN ru.is_admin_approval = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS is_admin_approval,
            cr.company_name AS Company, -- Get company name directly
            ru.action,
            CASE 
                WHEN ru.is_active = 1 THEN 'True' 
                ELSE 'False' 
            END AS is_active,
            ru.full_name AS Created_By,
            ru.created_at 
        FROM 
            mailblitzuat.tbl_users ru
        LEFT JOIN 
            mailblitzuat.tbl_designation_master dm ON ru.designation = dm.dm_id
        LEFT JOIN 
            mailblitzuat.tbl_role_master rm ON ru.role_id = rm.role_id
        LEFT JOIN 
            mailblitzuat.tbl_company_registration cr ON ru.company_id = cr.company_id
        WHERE
            (fromDate IS NULL AND toDate IS NULL) OR
            (ru.created_at BETWEEN fromDate AND toDate)

        UNION ALL

        SELECT 
            rul.full_name AS Name, 
            rul.email AS Email, 
            dm.dm_name AS Designation, 
            rm.role_name AS role,
            rul.phone_number AS Phone_Number,
            CASE 
                WHEN rul.is_individual = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Is_individual,
            CASE 
                WHEN rul.is_email_verified = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Is_email_verified,
            CASE 
                WHEN rul.is_admin_approval = 1 THEN 'Yes' 
                ELSE 'No' 
            END AS Is_admin_approval,
            cr.company_name AS Company, -- Get company name directly
            rul.action,
            CASE 
                WHEN rul.is_active = 1 THEN 'True' 
                ELSE 'False' 
            END AS Is_active,
            rul.full_name AS Created_By,
            rul.created_at
        FROM 
            mailblitzuat_logs.tbl_users_logs rul
        LEFT JOIN 
            mailblitzuat.tbl_designation_master dm ON rul.designation = dm.dm_id
        LEFT JOIN 
            mailblitzuat.tbl_role_master rm ON rul.role_id = rm.role_id
        LEFT JOIN 
            mailblitzuat.tbl_company_registration cr ON rul.company_id = cr.company_id
        WHERE
            (fromDate IS NULL AND toDate IS NULL) OR
            (rul.created_at BETWEEN fromDate AND toDate)
        ORDER BY 
            created_at;

    END IF;
END