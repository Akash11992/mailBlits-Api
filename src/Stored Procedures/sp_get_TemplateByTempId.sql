CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_TemplateByTempId`(p_company_id int,p_template_id int)
BEGIN
select t.tem_id as template_id,t.tem_name as template_name,t.raw_html as template_description,tattch.attachment_name as template_attachment_name,tattch.attachment_type as template_attachment_type,tattch.attachment_path as template_attachment_path,
doc.doc_name as document_name,doc.description as document_description,doc.is_password_protected,doc.password_key,df.doc_format_typ,doc.doc_path as document_path
 from tbl_template t
left join tbl_atchmt_tmplt_mapping tattch on tattch.company_id=t.tem_company_id and tattch.template_id=t.tem_id
left join tbl_document doc on doc.doc_company_id=t.tem_company_id and doc.doc_id=tattch.doc_id
left join tbl_doc_format df on df.doc_format_id=doc.doc_format_id
where t.tem_company_id=p_company_id and  t.tem_id=p_template_id and t.tem_is_active=1;
END