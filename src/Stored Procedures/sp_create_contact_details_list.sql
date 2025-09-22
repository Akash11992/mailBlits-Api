CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_contact_details_list`(

IN p_company_id int,
in p_source_id int,
IN p_list_name varchar(200),
p_contact_email varchar(200),
p_alternate_email varchar(200),
p_contact_detail json,
IN p_created_by int,
in p_contact_file_id int
)
BEGIN
DECLARE p_contact_id int;
declare p_list_id int;
DECLARE userExists INT;
DECLARE listExists INT;
DECLARE previous_id INT;
DECLARE new_id INT;
    
SELECT COUNT(*) INTO listExists
FROM tbl_list
WHERE list_name = p_list_name  and company_id=p_company_id and action!='d';

if listExists=0 then
insert into tbl_list (company_id,source_id,list_name,is_active,action,created_by) values(p_company_id,p_source_id,p_list_name,1,'c',p_created_by);
end if;
select list_id into p_list_id from tbl_list where company_id=p_company_id and list_name=p_list_name and is_active=1; 

  INSERT INTO tbl_contact (company_id, email,alternate_email,contact_detail, is_active, action,created_by)
  VALUES (p_company_id, p_contact_email,p_alternate_email,p_contact_detail, 1, 'c',p_created_by);

 select  max(c.contact_id) into p_contact_id from 
 tbl_list l
  left join tbl_contact c on c.company_id=l.company_id and c.is_active=1
 left join tbl_contact_list_mapping lm on lm.contact_id=c.contact_id and lm.company_id=c.company_id and lm.list_id=l.list_id and lm.is_active=1  
where l.list_name=p_list_name and l.company_id=p_company_id and l.is_active=1 and c.email=p_contact_email and c.alternate_email=p_alternate_email and c.is_active=1;
 
 /*
   IF (SELECT MAX(con_list_mapping_id) FROM tbl_contact_list_mapping) > 0 THEN
      SELECT MAX(con_list_mapping_id) INTO previous_id FROM tbl_contact_list_mapping;       
      SET new_id = previous_id + 1;
    ELSE
      SET new_id = 1;
    END IF;
*/
insert into tbl_contact_list_mapping(company_id,list_id,contact_id,is_active,action,created_by,contact_file_id) values(p_company_id,p_list_id,p_contact_id,1,'c',p_created_by,p_contact_file_id);
 
 SELECT 'success' as response;

END