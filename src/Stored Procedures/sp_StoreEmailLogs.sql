CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_StoreEmailLogs`(IN MyJsonData Json)
BEGIN

    INSERT INTO tblemailsentlogs (ToEmailID, scheduler_rule_id, mail_send_time, customize_message_id, message_id, email_status, remarks,sender_email)
    SELECT
        jt.ToEmailID,
        jt.scheduler_rule_id,
        jt.mail_send_time,
        jt.customize_message_id,
        jt.message_id,
        jt.email_status,
        jt.remarks,
        jt.sender_email
    FROM JSON_TABLE(MyJsonData, '$[*]' COLUMNS (
        ToEmailID varchar(100) PATH '$.ToEmailID',
        scheduler_rule_id int PATH '$.scheduler_rule_id',
        mail_send_time varchar(45) PATH '$.mail_send_time',
        customize_message_id varchar(100) PATH '$.customize_message_id',
        message_id varchar(1000) PATH '$.message_id',
        email_status varchar(45) PATH '$.email_status',
        remarks varchar(2000) PATH '$.remarks',
        sender_email varchar(300) PATH '$.sender_email'
    )) AS jt;

    UPDATE tbl_email_scheduler_rule_for_campaign AS r
    JOIN JSON_TABLE(MyJsonData, '$[*]' COLUMNS (
        scheduler_rule_id int PATH '$.scheduler_rule_id',
        message_id varchar(1000) PATH '$.message_id',
        customize_message_id varchar(100) PATH '$.customize_message_id',
        email_status varchar(45) PATH '$.email_status',
        remarks varchar(2000) PATH '$.remarks'
    )) AS jt ON r.scheduler_rule_id = jt.scheduler_rule_id
    JOIN tbl_email_status AS s ON s.email_status = jt.email_status
    SET r.remarks = jt.remarks,
        r.message_id = jt.message_id,
        r.customize_message_id = jt.customize_message_id,
        r.email_status_id = CASE
                                WHEN jt.email_status = 'Sent' THEN 2
                                ELSE 3
                            END,
       r.user_status_id = CASE
                                WHEN jt.email_status = 'Sent' THEN 4
                                ELSE 3
                            END;
END