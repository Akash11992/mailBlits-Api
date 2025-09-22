CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_contactdetailOflist`(p_cid int, p_list_id int, p_cont_id int,p_email text,p_contact_detail json,p_updated_by int)
BEGIN
declare count int;
select count(*) into count from tbl_contact_list_mapping where company_id=p_cid and list_id=p_list_id and  con_id=p_cont_id and is_active=1;
if count>0 then 
update tbl_contact set email=p_alt_email,contact_detail=p_contact_detail,updated_by=p_updated_by,created_at=current_timestamp() where contact_id=p_cont_id and is_active=1;
select "successfully replaced" as response;
end if;
END