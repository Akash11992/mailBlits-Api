CREATE  PROCEDURE `sp_StorebounceEmailLogs`(IN MyJsonData Json)
BEGIN


insert into tblbouceemaildetails
(companyID,ReadEmailAC,ToEmailID,email_status,email_bouncetime,bounceremarks)
SELECT * 
FROM  
     JSON_TABLE(MyJsonData, '$[*]' COLUMNS (
     companyID int PATH '$.companyID',
     ReadEmailAC VARCHAR(300)  PATH '$.ReadEmailAC',
     ToEmailID VARCHAR(300)  PATH '$.ToEmailID',
     email_status VARCHAR(10)  PATH '$.email_status',
     email_bouncetime VARCHAR(100) PATH '$.email_bouncetime',
     bounceremarks VARCHAR(500) PATH '$.bounceremarks')) bounce_rule_id;
     
     delete from tblbouceemaildetails where scheduler_rule_id is null 
and ToEmailID not in ( Select ToEmailID from tblemailsentlogs);

-- Update scheduler_rule_id
    UPDATE tblbouceemaildetails b
    JOIN tblemailsentlogs s ON b.ToEmailID = s.ToEmailID
    SET b.scheduler_rule_id = s.scheduler_rule_id
    WHERE b.scheduler_rule_id IS NULL
    AND b.created_date > s.created_date;
    
-- Update email_status_id in tbl_email_scheduler_rule_for_campaign
    UPDATE tbl_email_scheduler_rule_for_campaign AS r
    JOIN tblbouceemaildetails AS b ON r.scheduler_rule_id = b.scheduler_rule_id
    JOIN tbl_email_status AS s ON s.email_status = b.email_status
    SET r.email_status_id = s.email_status_id,
        r.user_status_id=5;

	update tbl_contact AS con
    Join tbl_email_scheduler_rule_for_campaign as r on r.contact_id=con.contact_id
   JOIN tbl_contact_list_mapping AS lm on lm.con_id=r.contact_id 
   Set con.is_active=0,lm.is_active=0 WHERE r.email_status_id=6;    
END