CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getRoleMappingWithForms`(
    IN f_ids TEXT, 
    IN r_ids TEXT, 
    IN c_ids TEXT
)
BEGIN
    -- Check if there are matching records
    IF (
        SELECT COUNT(*) 
        FROM tbl_role_mapping_with_forms 
        WHERE FIND_IN_SET(form_id, f_ids) > 0 
        AND FIND_IN_SET(role_id, r_ids) > 0 
        AND FIND_IN_SET(company_id, c_ids) > 0 
        AND is_active = 1
    ) > 0 THEN
        -- Select matching records
      SELECT 
            RMF.form_id,
            f.form_name,
            COUNT(DISTINCT RMF.role_mapping_id) AS role_mapping_count,
            GROUP_CONCAT(DISTINCT JSON_OBJECT('role_id', RMF.role_id, 'company_id', RMF.company_id)) AS role_company_ids,
            MAX(RMF.is_create) AS is_create,
            MAX(RMF.is_update) AS is_update,
            MAX(RMF.is_view) AS is_view,
            MAX(RMF.is_delete) AS is_delete,
            MAX(RMF.is_import) AS is_import,
            MAX(RMF.is_export) AS is_export,
            MAX(RMF.is_field) AS is_field,
            MAX(RMF.is_active) AS is_active,
            GROUP_CONCAT(DISTINCT RMF.created_by) AS created_by,
            MAX(RMF.created_date) AS created_date
        FROM 
            tbl_role_mapping_with_forms RMF
        LEFT JOIN 
            tbl_role_master R 
            ON RMF.role_id = R.role_id 
            AND RMF.company_id = R.company_id 
            AND R.is_active = 1
        LEFT JOIN 
            tbl_forms f
            ON RMF.form_id = f.form_id 
            AND R.is_active = 1    
        WHERE 
            FIND_IN_SET(RMF.form_id, f_ids) > 0 
            AND FIND_IN_SET(RMF.role_id, r_ids) > 0 
            AND FIND_IN_SET(RMF.company_id, c_ids) > 0 
            AND RMF.is_active = 1
        GROUP BY 
            RMF.form_id, f.form_name;


        -- Return count of matching records
        SELECT COUNT(*) AS count 
        FROM tbl_role_mapping_with_forms 
        WHERE FIND_IN_SET(form_id, f_ids) > 0 
        AND FIND_IN_SET(role_id, r_ids) > 0 
        AND FIND_IN_SET(company_id, c_ids) > 0 
        AND is_active = 1;
    ELSE
        -- Return failure message
        SELECT "fail" AS response;
        
        -- Return count of matching records (likely zero)
        SELECT COUNT(*) AS count 
        FROM tbl_role_mapping_with_forms 
        WHERE FIND_IN_SET(form_id, f_ids) > 0 
        AND FIND_IN_SET(role_id, r_ids) > 0 
        AND FIND_IN_SET(company_id, c_ids) > 0 
        AND is_active = 1;
    END IF;
END