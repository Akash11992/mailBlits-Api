CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_letter_head_get_by_id`(p_company_id int,p_letter_head_id int)
BEGIN
select lh.letter_head_name,lh.file_name,lh.file_type,lh.file_path from tbl_letter_heads lh
where lh.letter_head_id=p_letter_head_id and lh.company_id=p_company_id and lh.is_active=1;
END