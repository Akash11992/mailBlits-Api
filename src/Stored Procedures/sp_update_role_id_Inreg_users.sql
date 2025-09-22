CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_role_id_Inreg_users`(cid int,role_id int)
BEGIN
update tbl_users set role_id=role_id where company_id=cid;
END