CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_all_docTypes`()
BEGIN
    SELECT doc_format_id,doc_format_typ FROM tbl_doc_format where doc_format_is_active=1;
END