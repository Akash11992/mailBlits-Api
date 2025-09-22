CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_request_response`(
IN p_RRL_LOG_ID int,
IN p_response longtext
)
BEGIN
     UPDATE tbl_request_response_log
	 SET RRL_REQUEST_RESPONSE = p_response
     where RRL_LOG_ID=p_RRL_LOG_ID;
     
     select "Updated Successfully" as result;
END