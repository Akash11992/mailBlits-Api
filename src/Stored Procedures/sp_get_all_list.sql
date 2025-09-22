CREATE DEFINER=`root`@`%` PROCEDURE `sp_getall_list`(p_company_id int)
BEGIN
    DECLARE cidexist INT;
    
    -- Check if there are any active lists for the given company ID
    SELECT COUNT(company_id) INTO cidexist 
    FROM tbl_list 
    WHERE company_id = p_company_id and action!='d';

    -- If there are active lists, proceed with the selection
    IF cidexist > 0 THEN
        -- Select list details along with the count of contacts
        SELECT 
            l.list_id,
            l.company_id,
            l.list_name,
            l.is_active,
            l.created_at,
            max(u.full_name) AS created_by,
            COUNT(cl.contact_id) AS contact_count
        FROM 
            tbl_list l 
        LEFT JOIN 
            tbl_users u ON u.user_id = l.created_by
        LEFT JOIN 
            tbl_contact_list_mapping cl ON cl.company_id = p_company_id 
                                       AND cl.list_id = l.list_id 
                                       AND cl.is_active = 1
        WHERE 
            l.company_id = p_company_id and l.action!='d'
            
        GROUP BY 
            l.list_id,l.company_id
		ORDER BY l.created_at desc;   

        -- Select the count of active lists
        SELECT COUNT(*) AS count 
        FROM tbl_list 
        WHERE company_id = p_company_id and action!='d';
    ELSE
        -- If no active lists are found, return "fail"
        SELECT "fail" AS response;
    END IF;
END