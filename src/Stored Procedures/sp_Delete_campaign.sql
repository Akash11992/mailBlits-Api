CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_Delete_campaign`(IN companyID INT, IN campaignID INT)
BEGIN

    -- Delete from tbl_email_scheduler_document_mapping
    DELETE FROM tbl_email_scedhuler_document_mapping WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_email_scheduler_template_mapping
    DELETE FROM tbl_email_scedhuler_template_mapping WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_email_scheduler_rule_for_campaign
    DELETE FROM tbl_email_scheduler_rule_for_campaign WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_days_campaign_mapping
    DELETE FROM tbl_days_campaign_mapping WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_schedule_campaign_mapping
    DELETE FROM tbl_schedule_campaign_mapping WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_atchmt_campaign_mapping
    DELETE FROM tbl_atchmt_campaign_mapping WHERE company_id = companyID AND campaign_id = campaignID;

    -- Delete from tbl_campaign
    DELETE FROM tbl_campaign WHERE company_id = companyID AND campaign_id = campaignID;

    SELECT 'Campaign deleted successfully';
END