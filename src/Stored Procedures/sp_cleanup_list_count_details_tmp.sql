CREATE PROCEDURE `sp_cleanup_list_count_details_tmp` (
    IN p_list_name VARCHAR(100),
    IN p_created_by INT
)
BEGIN
  -- Declare variable to store affected rows
  DECLARE deleted_rows INT DEFAULT 0;

  -- Delete matching rows
  DELETE FROM tbl_list_count_tmp_data 
  WHERE list_name = p_list_name AND created_by = p_created_by;

  -- Get the number of affected rows
  SET deleted_rows = ROW_COUNT();

  -- Return result
  SELECT deleted_rows AS rows_deleted;
END 

