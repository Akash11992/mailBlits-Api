CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_company`(p_is_individual tinyint,p_cr_company_name varchar(200),p_cr_email varchar(300),p_cr_contact varchar(14),p_cr_portal text,p_cr_ref_industry_id int,p_cr_ref_employee_count_id int,p_cr_ref_tax_id int,p_cr_tax_info varchar(15),p_cr_ref_country_id int,p_cr_ref_state_id int,p_cr_ref_city_id int,p_cr_postal_code varchar(10),p_address longtext,p_created_by int,p_company_domain varchar(50),p_cr_logo_url longtext,p_action varchar(1),p_company_type_id int,p_is_group boolean,p_group_name varchar(100))
BEGIN
    declare cid int;
  
    if(select count(*) from tbl_company_registration where domain=p_company_domain AND is_active=1 AND domain IS NOT NULL )>0 then
        select "fail" as response;    
    else

        insert into tbl_company_registration
		(`is_individual`,`company_name`, `company_email`,`contact_number`,`portal`,`industry_id`,`employee_count_id`,`tax_id`, `tax_info`,`country_id`,`state_id`,`city_id`,`postal_code`,`address`,`created_by`,`domain`,`logo_url`,`is_active`,`action`,`company_type_id`,`is_group_company`,`group_name`) 
		values(p_is_individual,p_cr_company_name,p_cr_email,p_cr_contact,p_cr_portal,p_cr_ref_industry_id,p_cr_ref_employee_count_id,p_cr_ref_tax_id,p_cr_tax_info,p_cr_ref_country_id,p_cr_ref_state_id,p_cr_ref_city_id,p_cr_postal_code,p_address,p_created_by,p_company_domain,p_cr_logo_url,'1',p_action,p_company_type_id,p_is_group,p_group_name);
      
      -- Retrieve the company_id using the unique domain field
	SELECT company_id INTO cid
	FROM tbl_company_registration
	WHERE is_active=1 order by company_id desc limit 1;

        -- Ensure the insert was successful
        IF cid IS NOT NULL THEN
		SELECT "success" AS response;

        insert into tbl_role_master(role_name,company_id,is_active,created_at,`action`,created_by,group_name)values('admin',cid,1,current_timestamp(),'c',p_created_by,p_group_name);
        select role_id  from tbl_role_master where  role_name='admin' and company_id=cid and is_active=1;

        call sp_SetallPermissionToAdmin(cid,p_created_by,null);

        select c.company_id as company_id, c.logo_url, t.company_type ,c.is_group_company,c.group_name
        from tbl_company_registration c
         LEFT JOIN  tbl_company_type t on t.company_type_id=c.company_type_id and t.is_active=1
        where c.company_id=cid and c.is_active=1;
ELSE
SELECT "fail: company not inserted" AS response;

END IF;
END IF;
END