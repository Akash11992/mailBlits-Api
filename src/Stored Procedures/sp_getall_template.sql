CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_template`(p_company_id int)
BEGIN
declare cidexist int;
select count(company_id) into cidexist from tbl_template where company_id=p_company_id and is_active=1;
if cidexist>0 then
select t.template_id,t.company_id,t.template_name,t.raw_html,t.is_active,t.created_at,u.full_name as created_by,td.doc_name,td.description,td.doc_id as documentId
from tbl_template t
inner join tbl_users u on u.user_id=t.created_by
inner join tbl_attachment_template_mapping tad on tad.template_id=t.template_id
inner join tbl_document td on td.doc_id=tad.doc_id
where t.company_id=p_company_id and t.is_active=1;
select count(*) as count from tbl_template where company_id=p_company_id and is_active=1;
else
select "fail" as response;
end if;
END