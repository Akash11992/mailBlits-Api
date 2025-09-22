CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_insert_request_response_log`(
   IN p_RRL_REQUEST_METHOD varchar(100),
   IN p_RRL_REQUEST_URL varchar(450),
   IN p_RRL_REQUEST_BODY text
)
BEGIN
   --  SET p_RRL_REQUEST_BODY = REPLACE(p_RRL_REQUEST_BODY, '''', '"');
      DECLARE id int;
     
     INSERT INTO tbl_request_response_log(
         RRL_REQUEST_METHOD,
         RRL_REQUEST_URL,
         RRL_REQUEST_BODY
     )
     VALUES (
         p_RRL_REQUEST_METHOD,
         p_RRL_REQUEST_URL,
         p_RRL_REQUEST_BODY
     );

     SELECT RRL_LOG_ID as id from tbl_request_response_log where RRL_REQUEST_METHOD=p_RRL_REQUEST_METHOD AND RRL_REQUEST_URL =p_RRL_REQUEST_URL AND RRL_REQUEST_BODY =p_RRL_REQUEST_BODY order by RRL_LOG_ID  DESC LIMIT 1;
    -- select id as result;
END