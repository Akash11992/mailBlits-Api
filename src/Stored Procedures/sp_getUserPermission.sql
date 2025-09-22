CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getUserPermission`(p_role_id varchar(50),p_company_id varchar(50))
BEGIN
IF(select count(*) from tbl_role_mapping_with_forms where role_id=p_role_id and company_id=p_company_id and is_active=1 and `action`!='d')>0
then
select RMF.*,f.form_name,roles.role_name as role from tbl_role_mapping_with_forms RMF 
left join tbl_forms f on RMF.form_id=f.form_id 
left join tbl_role_master roles on RMF.role_id=roles.role_id and RMF.company_id=roles.company_id and roles.is_active=1 and roles.`action`!='d'
 where RMF.role_id=p_role_id and RMF.company_id=p_company_id and RMF.is_active=1 and RMF.`action`!='d';
 
 select count(*) as count from tbl_role_mapping_with_forms RMF 
left join tbl_forms f on RMF.form_id=f.form_id 
left join tbl_role_master roles on RMF.role_id=roles.role_id and RMF.company_id=roles.company_id and roles.is_active=1 and roles.`action`!='d'
 where RMF.role_id=p_role_id and RMF.company_id=p_company_id and RMF.is_active=1 and  RMF.`action`!='d';
ELSE
select "fail" as response;
select count(*) as count from tbl_role_mapping_with_forms where role_id=p_role_id and company_id=p_company_id and is_active=1 and `action`!='d';
end if;

 
END