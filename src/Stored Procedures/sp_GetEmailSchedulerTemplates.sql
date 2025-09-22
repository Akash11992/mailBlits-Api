CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_GetEmailSchedulerTemplates`(IN schedulerRuleId INT, IN companyId INT)
BEGIN
    SELECT template_name, template_description
    FROM tbl_email_scedhuler_template_mapping
    WHERE scheduler_rule_id = schedulerRuleId AND company_id = companyId;
END