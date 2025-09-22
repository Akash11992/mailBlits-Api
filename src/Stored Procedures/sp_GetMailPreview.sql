CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_GetMailPreview`(IN schedulerRuleId INT, IN companyId INT)
BEGIN
    DECLARE templateListCursor CURSOR FOR
        SELECT template_name, template_description
        FROM tbl_email_scedhuler_template_mapping
        WHERE scheduler_rule_id = schedulerRuleId AND company_id = companyId and is_active=1;

    DECLARE documentListCursor CURSOR FOR
        SELECT document_name, document_description, is_password_protected, password_value, doc_format_typ, doc_path_url
        FROM tbl_email_scedhuler_document_mapping tesdm
        INNER JOIN tbl_doc_format df ON tesdm.doc_format_id = df.doc_format_id
        WHERE tesdm.scheduler_rule_id = schedulerRuleId AND tesdm.company_id = companyId and tesdm.is_active=1;

    OPEN templateListCursor;
    OPEN documentListCursor;

    SELECT "Email fetched successfully!" AS message;

    SELECT * FROM templateListCursor;
    SELECT * FROM documentListCursor;

    CLOSE templateListCursor;
    CLOSE documentListCursor;
END