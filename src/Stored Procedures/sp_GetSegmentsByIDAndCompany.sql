CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_GetSegmentsByIDAndCompany`(
    IN in_Segmentsid INT,
    IN in_company_id INT
)
BEGIN
    SELECT *
    FROM tbl_segments
    WHERE segments_id = in_Segmentsid
        AND company_id = in_company_id and is_active=1;
END