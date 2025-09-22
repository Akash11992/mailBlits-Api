CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getAllContactDetailsByCid`(p_cid INT, p_list_id INT,p_segment_id Int)
BEGIN
    DECLARE total_contacts INT;
    DECLARE offset_val INT;
  
    
    SELECT COUNT(*) INTO total_contacts
    FROM tbl_contact
    WHERE is_active = 1 AND company_id = p_cid;

     IF total_contacts > 0  THEN
        IF p_list_id IS NULL THEN
            SELECT contact_id, company_id, contact_detail, is_active, created_by, created_at
            FROM tbl_contact
            WHERE is_active = 1 AND company_id = p_cid
            ORDER BY created_at DESC ;
         
            
			SELECT count(*) as count
            FROM tbl_contact
            WHERE is_active = 1 AND company_id = p_cid
            ORDER BY created_at DESC;
        ELSE
        
        
            SELECT l.list_id, c.contact_id, c.company_id, c.contact_detail, c.is_active, c.created_by, c.created_at
            FROM tbl_contact_list_mapping l
            LEFT JOIN tbl_contact c ON l.contact_id = c.contact_id and c.company_id=p_cid and c.is_active=1
            WHERE l.is_active = 1 AND l.company_id = p_cid AND l.list_id = p_list_id
            ORDER BY c.contact_id ASC ;
           
            
            SELECT count(*) as count
            FROM tbl_contact_list_mapping l
            LEFT JOIN tbl_contact c ON l.contact_id = c.contact_id and c.company_id=p_cid and c.is_active=1
            WHERE l.is_active = 1 AND l.company_id = p_cid AND l.list_id = p_list_id
            ORDER BY c.contact_id ASC;
        END IF;
    ELSE
        SELECT 'fail' AS response;
        
        
    END IF;
END