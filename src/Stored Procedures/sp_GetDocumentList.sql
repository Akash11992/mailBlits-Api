CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_GetDocumentList`(IN schedulerRuleId INT, IN companyId INT)
BEGIN
    SELECT tesdm.document_name, tesdm.document_description, tesdm.is_password_protected, tesdm.password_value, df.doc_format_typ, tesdm.doc_path_url
    FROM tbl_email_scedhuler_document_mapping tesdm
    INNER JOIN tbl_doc_format df ON tesdm.doc_format_id = df.doc_format_id
    WHERE tesdm.scheduler_rule_id = schedulerRuleId AND tesdm.company_id = companyId;
END