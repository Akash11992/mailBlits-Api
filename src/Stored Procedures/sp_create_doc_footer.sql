CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_doc_footer`(p_company_id int,p_footer_name varchar(125),p_description text,p_created_by varchar(45))
BEGIN

 DECLARE footerExists INT;
 SELECT COUNT(*) INTO footerExists
FROM tbl_doc_footer
WHERE footer_name = p_footer_name  and company_id=p_company_id and is_active=1;

if footerExists>0 then
select "fail" as response;
else
insert into tbl_doc_footer (company_id,footer_name,`description`,is_active,created_by) values(p_company_id,p_footer_name,p_description,1,p_created_by);
end if;
END