CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_update_doc_template_mapping_new`(
    IN p_company_id INT,
    IN p_template_id int,
    IN p_doc_id TEXT,
    IN p_updated_by VARCHAR(45)
)
BEGIN
/* declare tempcount int;

select count(*) into tempcount from tbl_atchmt_tmplt_mapping  where template_id=p_temp_id and company_id=p_company_id and doc_id=p_doc_id and is_active=1;

 if tempcount >0 then 
        -- update  document template mapping table
        update  tbl_atchmt_tmplt_mapping set
            doc_id=p_doc_id,
            updated_by=p_updated_by
		where template_id=p_temp_id and company_id=p_company_id and doc_id=p_doc_id and is_active=1;

		SELECT "success" AS response;

else        */

-- Delete any existing records with the same template_id and non-null doc_id
-- DELETE FROM tbl_atchmt_tmplt_mapping WHERE company_id=p_company_id and template_id = p_template_id AND doc_id IS NOT NULL ;

        -- Insert into document template mapping table
        INSERT INTO tbl_atchmt_tmplt_mapping (
            company_id,
            template_id,
            doc_id,
            is_active,
            created_by,
            updated_by
        )
        VALUES (
            p_company_id,
            p_template_id,
            p_doc_id,
            1,
            p_updated_by,
            p_updated_by
        );

        SELECT "success" AS response;
  -- end if;
END