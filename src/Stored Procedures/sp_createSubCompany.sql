CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_createSubCompany`(
    IN p_cr_company_name VARCHAR(200),
    IN p_cr_email VARCHAR(300),
    IN p_cr_contact VARCHAR(14),
    IN p_cr_portal TEXT,
    IN p_cr_ref_industry_id INT,
    IN p_cr_ref_employee_count_id INT,
    IN p_cr_ref_tax_id INT,
    IN p_cr_tax_info VARCHAR(15),
    IN p_cr_ref_country_id INT,
    IN p_cr_ref_state_id INT,
    IN p_cr_ref_city_id INT,
    IN p_cr_postal_code VARCHAR(10),
    IN p_address LONGTEXT,
    IN p_created_by INT,
    IN p_company_domain VARCHAR(50),
    IN p_cr_logo_url LONGTEXT,
    IN p_action VARCHAR(1),
    IN p_company_type_id INT,
    IN p_is_group BOOLEAN,
    IN p_group_name VARCHAR(100)
)
BEGIN
    -- Declare all variables at the top
    DECLARE cid INT;

    -- Check if the company domain already exists
    IF (SELECT COUNT(*) FROM tbl_company_registration WHERE domain = p_company_domain AND is_active = 1 AND domain IS NOT NULL) > 0 THEN
        SELECT "fail" AS response;    
    ELSE
        -- Insert the new company registration
        INSERT INTO tbl_company_registration (
            `company_name`, `company_email`, `contact_number`, `portal`, 
            `industry_id`, `employee_count_id`, `tax_id`, `tax_info`, 
            `country_id`, `state_id`, `city_id`, `postal_code`, 
            `address`, `created_by`, `domain`, `logo_url`, 
            `is_active`, `action`, `company_type_id`, 
            `is_group_company`, `group_name`
        ) 
        VALUES (
            p_cr_company_name, p_cr_email, p_cr_contact, p_cr_portal, 
            p_cr_ref_industry_id, p_cr_ref_employee_count_id, p_cr_ref_tax_id, p_cr_tax_info, 
            p_cr_ref_country_id, p_cr_ref_state_id, p_cr_ref_city_id, p_cr_postal_code, 
            p_address, p_created_by, p_company_domain, p_cr_logo_url, 
            '1', 'c', p_company_type_id, 
            p_is_group, p_group_name
        );

        -- Get the last inserted company ID
        SELECT company_id INTO cid
	FROM tbl_company_registration
	WHERE is_active=1 order by company_id desc limit 1;

        -- Return success response
         SELECT "success" AS response,cid AS company_id;
    END IF;
END