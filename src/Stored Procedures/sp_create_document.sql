CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_document`(p_doc_company_id int,p_doc_type varchar(125),p_description LONGTEXT,p_created_by varchar(45),doc_format_id int,is_password_protected tinyint,password_key JSON,p_doc_path text,p_letter_head_id int,p_header_id int, p_footer_id int, p_list_id int)
BEGIN
DECLARE previous_id INT;
DECLARE new_id INT;
 DECLARE docExists INT;
 SELECT COUNT(*) INTO docExists
FROM tbl_document
WHERE doc_name = p_doc_type  and company_id=p_doc_company_id and is_active=1;

if docExists>0 then
select "fail" as response;
else
 /* IF (SELECT MAX(doc_id) FROM tbl_document) > 0 THEN
      
      SELECT MAX(doc_id) INTO previous_id FROM tbl_document;
      SET new_id = previous_id + 1;
    ELSE
      SET new_id = 1;
    END IF;
   */
insert into tbl_document (company_id,doc_name,`description`,is_active,created_by,doc_format_id,is_password_protected,password_key,doc_path,header_id,footer_id, list_id, action) values(p_doc_company_id,p_doc_type,p_description,1,p_created_by,doc_format_id,is_password_protected,password_key,p_doc_path,p_header_id,p_footer_id, p_list_id,'c');
end if;
END