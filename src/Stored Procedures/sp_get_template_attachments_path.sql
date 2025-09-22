CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_template_attachments_path`(p_company_id int,p_template_id int,in p_attachment_name text)
BEGIN
-- SELECT attachment_path FROM tbl_atchmt_tmplt_mapping WHERE company_id = p_company_id and template_id=p_template_id and attachment_name NOT IN (p_attachment_name)  and attachment_name is not null;
SELECT attachment_path FROM tbl_atchmt_tmplt_mapping WHERE company_id = p_company_id and template_id=p_template_id and  FIND_IN_SET(attachment_name, p_attachment_name) = 0  and attachment_name is not null;

END