CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_UpdateCampaignStatus`(
    IN isActiveParam INT,
    IN campaignIdParam INT,
    IN companyIdParam INT
)
BEGIN
    UPDATE tbl_campaign
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;

    UPDATE tbl_email_scheduler_rule_for_campaign
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;

    UPDATE tbl_email_scedhuler_template_mapping
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;

    UPDATE tbl_email_scedhuler_document_mapping
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;

    UPDATE tbl_days_campaign_mapping
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;

    UPDATE tbl_attachment_campaign_mapping
    SET is_active = isActiveParam,action='u'
    WHERE campaign_id = campaignIdParam
    AND company_id = companyIdParam;
END