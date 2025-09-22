CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_save_count_in_tmp_table`(
    IN p_raw_data JSON,
    IN p_list_name VARCHAR(100),
    IN p_created_by INT
)
BEGIN
  DECLARE current_datetime DATETIME;

  -- Set current timestamp
  SET current_datetime = NOW();

  -- Insert each object from the JSON array
  INSERT INTO tbl_list_count_tmp_data (list_name, created_by, data, type, created_at)
  SELECT 
    p_list_name,
    p_created_by,
    jt.data,
    jt.type,
    current_time
  FROM JSON_TABLE(
    p_raw_data,
    '$[*]' COLUMNS (
      type VARCHAR(50) PATH '$.type',
      data JSON PATH '$.data'
    )
  ) AS jt;
  
  -- Optional: Return count inserted
  SELECT ROW_COUNT() AS rows_inserted;

END