CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_create_role_mapping_with_forms`(
  f_id INT,
  r_id INT,
  c_id int,
  i_create BOOLEAN,
  i_update BOOLEAN,
  i_view BOOLEAN,
  i_delete BOOLEAN,
  i_import BOOLEAN,
  i_export BOOLEAN,
  i_field BOOLEAN,
  p_created_by int)
BEGIN

  IF (
    (
      SELECT COUNT(*)
      FROM tbl_role_mapping_with_forms
      WHERE 
        form_id = f_id
        AND role_id = r_id
        AND company_id = c_id
        AND is_view = i_view
        AND is_create = i_create
        AND is_update = i_update
        AND is_delete = i_delete
        AND is_import = i_import
        AND is_export = i_export
        AND is_field = i_field
    ) > 0
  ) THEN
    SELECT "fail" AS response; 
  ELSEIF (
    (
      SELECT COUNT(*)
      FROM tbl_role_mapping_with_forms
      WHERE 
      form_id = f_id
        AND role_id = r_id
        AND company_id = c_id
    ) > 0
  ) THEN
    UPDATE tbl_role_mapping_with_forms
    SET
      is_view = i_view,
      is_create = i_create,
      is_update = i_update,
      is_delete = i_delete,
      is_import = i_import,
	is_export = i_export,
	is_field = i_field,
    action='u',
      created_date = current_timestamp(),
      created_by = p_created_by
    WHERE
    
       form_id = f_id
      AND role_id = r_id
      AND company_id = c_id;
    SELECT "updated" AS response; 
  ELSE
   
    INSERT INTO tbl_role_mapping_with_forms (
     
      form_id,
      role_id,
      company_id,
      is_create,
      is_update,
      is_view,
      is_delete,
      is_import,
      is_export,
      is_field,
      is_active,
      created_date,
      created_by,
      action    )
    VALUES (
      f_id,
      r_id,
      c_id,
      i_create,
      i_update,
      i_view,
      i_delete,
      i_import,
      i_export,
      i_field,
      1,
     current_timestamp(),
      p_created_by,
      'c'
    );
    SELECT "success" AS response; 
  END IF;
END