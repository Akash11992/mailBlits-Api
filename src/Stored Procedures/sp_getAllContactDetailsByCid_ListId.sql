CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getAllContactDetailsByCid_ListId`(p_cid int,p_list_id int)
BEGIN
if(select count(*) from tbl_contact_list_mapping where  company_id=p_cid and list_id=p_list_id and is_active=1 )>0 
then
select l.list_id,c.contact_id,c.company_id,c.contact_detail,c.is_active,c.created_by,c.created_at  from tbl_contact_list_mapping l 
left join tbl_contact c on c.is_active=1 and c.company_id=p_cid and l.contact_id=c.contact_id
where l.is_active=1 and l.company_id=p_cid and l.list_id=p_list_id order by c.contact_id asc;
else
select 'fail' as response;
end if;
END