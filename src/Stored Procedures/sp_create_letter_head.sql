CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_letter_head`(p_company_id int,p_letter_head_name varchar(100),p_file_name varchar(100),p_file_type text,p_file_path text,p_created_by int)
BEGIN

declare namecount int;
select count(*) into namecount from tbl_letter_heads where company_id=p_company_id and letter_head_name=p_letter_head_name and is_active=1; 

if namecount>0 then
select "fail" as response;
else
insert into tbl_letter_heads (company_id,letter_head_name,file_name,file_type,file_path,is_active,created_by,created_at)
values(p_company_id,p_letter_head_name,p_file_name,p_file_type,p_file_path,1,p_created_by,current_timestamp());
select "success" as response;
end if;
END