CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_role_mapping_withforms_update`(p_form_id int, p_role_id int,p_company_id int,p_is_view boolean,p_is_create boolean,p_is_update boolean,p_is_delete boolean,p_is_import boolean,p_is_export boolean, p_is_field boolean,p_updated_by int)
BEGIN
update tbl_role_mapping_with_forms set is_view=p_is_view,is_create=p_is_create,is_update=p_is_update,is_delete=p_is_delete,is_import=p_is_import,is_export=p_is_export,is_field=p_is_field,updated_date=current_timestamp(),updated_by=p_updated_by where 
company_id=p_company_id and form_id=p_form_id and role_id=p_role_id and is_active=1;
select "success" as response;
END