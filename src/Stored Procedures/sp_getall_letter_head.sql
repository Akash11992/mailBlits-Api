CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getall_letter_head`(p_company_id int)
BEGIN

select lh.letter_head_id,lh.letter_head_name,lh.file_name,lh.file_type,lh.file_path,u.full_name as created_by from tbl_letter_heads lh
 inner join tbl_users u on u.user_id=lh.created_by
 where lh.company_id=p_company_id and lh.is_active=1;
 
select count(*) as count from tbl_letter_heads where company_id=p_company_id and is_active=1;

END