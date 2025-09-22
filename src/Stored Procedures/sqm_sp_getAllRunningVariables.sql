CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sqm_sp_getAllRunningVariables`(IN Cid INT, IN ListId INT)
BEGIN
    /* 
    select distinct concat('{{',`key`,'}}') as 'keys' from tbl_contact_details where con_company_id=Cid and con_is_active=1;
    select count(distinct concat('{{',`key`,'}}')) as var_count from tbl_contact_details where con_company_id=Cid and con_is_active=1;
    */

    SELECT DISTINCT JSON_KEYS(contact_detail) AS unique_keys 
    FROM tbl_contact
    WHERE company_id = Cid
    AND is_active = 1
    AND (ListId IS NULL OR ListId IN (SELECT list_id FROM tbl_contact_list_mapping WHERE con_id = tbl_contact.contact_id));

    SELECT COUNT(DISTINCT JSON_KEYS(contact_detail)) AS var_count
    FROM tbl_contact
    WHERE company_id = Cid
    AND is_active = 1
    AND (ListId IS NULL OR ListId IN (SELECT list_id FROM tbl_contact_list_mapping WHERE con_id = tbl_contact.contact_id));

END