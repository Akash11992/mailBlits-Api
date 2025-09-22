CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getSegmentsByCompanyId`(IN in_company_id INT)
BEGIN
    SELECT seg.*, reg.full_name as new_created_by FROM tbl_segments as seg 
   left join  tbl_users as reg on reg.user_id = seg.created_by and reg.is_active=1 WHERE seg.company_id = in_company_id and seg.is_active=1  order by seg.created_at desc;
END