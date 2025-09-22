CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_StoreEmailTrackerLogs`(IN MyJsonData Json)
BEGIN


insert into tblEmailTrackerLogs
(FullTrackerText,PropID,UserAction,EmailID,scheduler_rule_id,OpenDate)
SELECT * 
FROM  
     JSON_TABLE(MyJsonData, '$[*]' COLUMNS (
     FullTrackerText varchar(500) PATH '$.FullTrackerText',
     PropID varchar(30) PATH '$.PropID',
     UserAction varchar(10)  PATH '$.UserAction',
     EmailID VARCHAR(300)  PATH '$.EmailID',
     scheduler_rule_id int PATH '$.scheduler_rule_id',
     OpenDate varchar(300) PATH '$.OpenDate')) Tracker_rule_id;

 UPDATE tbl_email_scheduler_rule_for_campaign AS r
        JOIN JSON_TABLE(MyJsonData, '$[*]' COLUMNS (
           scheduler_rule_id INT PATH '$.scheduler_rule_id',
           UserAction VARCHAR(10)  PATH '$.UserAction'
        )) AS jt ON r.scheduler_rule_id = jt.scheduler_rule_id
        JOIN tbl_user_status AS s ON s.tbl_user_status_description = jt.UserAction
        SET 
            r.user_status_id = CASE
                                  WHEN jt.UserAction = 'Open' THEN 1
                                  WHEN jt.UserAction = 'Clicked' THEN 2
                                   WHEN jt.UserAction = 'Under Process' THEN 3
                                  ELSE 4
                              END;

END