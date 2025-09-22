CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_insert_contact_review`(
    IN p_file_name VARCHAR(200), 
    IN p_file_path longtext, 
    IN p_file_type VARCHAR(100), 
    IN p_company_id INT, 
    IN p_total_contact INT, 
    IN p_duplicate_contact INT, 
    IN p_re_added_contact INT,
    IN p_ignore_count int,
    IN p_new_contact int,
    IN p_created_by INT
)
BEGIN
    INSERT INTO tbl_contact_file (
        file_name, 
        file_path, 
        file_type, 
        company_id, 
        total_contact, 
        duplicate_contact, 
        re_added_contact, 
        ignore_count,
        new_contact,
        action, 
        created_by
    ) 
    VALUES (
        p_file_name, 
        p_file_path, 
        p_file_type, 
        p_company_id, 
        p_total_contact, 
        p_duplicate_contact, 
        p_re_added_contact, 
        p_ignore_count,
        p_new_contact,
        'c', 
        p_created_by
    );
    select file_id as contact_file_id from tbl_contact_file where file_name=p_file_name and 
        file_path=p_file_path and file_type=p_file_type and company_id=p_company_id and is_active=1;
END