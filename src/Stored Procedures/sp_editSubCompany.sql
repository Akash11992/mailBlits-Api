CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_editSubCompany`(
    IN p_company_id INT,
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
    IN p_company_domain VARCHAR(50),
    IN p_cr_logo_url LONGTEXT,
    IN p_company_type_id INT,
    IN p_is_group BOOLEAN,
    IN p_group_name VARCHAR(100),
    IN p_created_by INT
)
BEGIN
    -- Update the existing company registration
    UPDATE tbl_company_registration
    SET 
        company_name = p_cr_company_name,
        company_email = p_cr_email,
        contact_number = p_cr_contact,
        portal = p_cr_portal,
        industry_id = p_cr_ref_industry_id,
        employee_count_id = p_cr_ref_employee_count_id,
        tax_id = p_cr_ref_tax_id,
        tax_info = p_cr_tax_info,
        country_id = p_cr_ref_country_id,
        state_id = p_cr_ref_state_id,
        city_id = p_cr_ref_city_id,
        postal_code = p_cr_postal_code,
        address = p_address,
        domain = p_company_domain,
        logo_url = p_cr_logo_url,
        company_type_id = p_company_type_id,
        is_group_company = p_is_group,
        group_name = p_group_name,
        is_active = p_is_active,
        action = 'u',
        created_by = p_created_by,
        created_date = NOW()
    WHERE company_id = p_company_id;

    IF ROW_COUNT() > 0 THEN
        SELECT "success" AS response;
    ELSE
        SELECT "fail" AS response;
    END IF;
END