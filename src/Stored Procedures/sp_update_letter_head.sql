CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_letter_head`(p_company_id int,p_letter_head_id int,p_letter_head_name varchar(100),p_file_name varchar(100),p_file_type text,p_file_path text,p_updated_by int)
BEGIN
update tbl_letter_heads set letter_head_name=p_letter_head_name,file_name=p_file_name,file_type=p_file_type,file_path=p_file_path,updated_by=p_updated_by,created_at=current_timestamp()
where company_id=p_company_id and letter_head_id=p_letter_head_id and is_active=1;

END