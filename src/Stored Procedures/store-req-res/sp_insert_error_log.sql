CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_insert_error_log`(
IN p_method varchar(64),
IN p_url varchar(400),
IN p_code int ,
IN p_body text,
IN p_response text
)
BEGIN
     insert into tbl_error_log(EL_METHOD,EL_URL,EL_REQ_CODE,EL_REQUEST_BODY,EL_REQUEST_RESPONSE)
     values(p_method,p_url,p_code,p_body,p_response);
     
     select "inserted successfully" as result;
END