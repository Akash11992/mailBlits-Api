CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_isrole_assigned`(p_ru_role_id int,p_companyId int)
BEGIN
declare rolecount int;
SELECT count(*) into rolecount FROM tbl_users WHERE role_id=p_ru_role_id AND company_id=p_companyId;
if rolecount>0 then
select 1 as response;
else
select 0 as response;
end if;
END