CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getProtocolType`()
BEGIN
SELECT 
	protocol_id AS Protocol_Id,
    protocol_name AS Protocol_name 
    FROM mailblitzuat.tbl_protocol_type;
END