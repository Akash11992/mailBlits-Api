CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_validateContactPresent_inList`(p_list_id int,p_company_id int,p_email varchar(200))
BEGIN
declare existcount int;
DECLARE readdcount INT;

select count(lm.con_id) into existcount from 
 tbl_list l
  left join tbl_contact c on c.company_id=l.company_id and c.is_active=1 and c.email=p_email 
 left join tbl_contact_list_mapping lm on lm.con_id=c.contact_id and lm.company_id=c.company_id and lm.list_id=l.list_id and lm.is_active=1  
where l.company_id=p_company_id and l.is_active=1;
    

if (existcount>0 and p_list_id IS NOT NULL) then
select "exist" as response;
select existcount ;
select c.email,c.contact_id from 
 tbl_list l
  left join tbl_contact c on c.company_id=l.company_id and c.is_active=1 and c.email=p_email 
 left join tbl_contact_list_mapping lm on lm.con_id=c.contact_id and lm.company_id=c.company_id and lm.list_id=l.list_id and lm.is_active=1  
where l.list_id=p_list_id and l.company_id=p_company_id and l.is_active=1;

else
select "new" as response;
end if;
END