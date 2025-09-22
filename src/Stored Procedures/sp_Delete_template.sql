CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_Delete_template`(IN tempId INT,IN companyId INT)
BEGIN

    -- Delete from tbl_atchmt_tmplt_mapping
    DELETE FROM tbl_atchmt_tmplt_mapping WHERE template_id = tempId AND company_id=companyId;

    -- Delete from tbl_template
    DELETE FROM tbl_template WHERE tem_id = tempId AND tem_company_id=companyId;

    SELECT 'Template deleted successfully';
END