CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sqm_sp_delete_contact`(p_contact_id int)
BEGIN
    DELETE FROM tbl_contact WHERE contact_id = p_contact_id;
END