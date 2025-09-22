CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_doc_header`(p_company_id int,p_header_name varchar(125),p_description text,p_created_by varchar(45))
BEGIN

 DECLARE headerExists INT;
 SELECT COUNT(*) INTO headerExists
FROM tbl_doc_header
WHERE header_name = p_header_name  and company_id=p_company_id and is_active=1;

if headerExists>0 then
select "fail" as response;
else
insert into tbl_doc_header (company_id,header_name,`description`,is_active,created_by) values(p_company_id,p_header_name,p_description,1,p_created_by);
end if;
END