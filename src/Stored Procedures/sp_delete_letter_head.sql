CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_delete_letter_head`(p_company_id int,p_letter_head_id int)
BEGIN
delete from tbl_letter_heads lh where lh.letter_head_id=p_letter_head_id and lh.company_id=p_company_id;
END