CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_company_id_Inreg_users`(p_cid int,p_ru_id int,p_group_name varchar(100))
BEGIN
UPDATE tbl_users SET company_id=p_cid,group_name=p_group_name WHERE user_id=p_ru_id;
END