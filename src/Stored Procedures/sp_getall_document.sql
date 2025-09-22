CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_document`(p_company_id int)
BEGIN
select doc_id,doc_name,doc_company_id,`description`,is_active from tbl_document where doc_company_id=p_company_id and is_active=1;
END