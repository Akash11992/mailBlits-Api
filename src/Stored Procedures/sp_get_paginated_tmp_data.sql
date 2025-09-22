CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_paginated_tmp_data`(
    IN p_list_name VARCHAR(100),
    IN p_type VARCHAR(50),
    IN p_page_number INT,
    IN p_page_size INT
)
BEGIN
  DECLARE v_offset INT;

  -- Calculate offset
  SET v_offset = (p_page_number - 1) * p_page_size;

  -- Return paginated result
  SELECT 
    id,
    list_name,
    created_by,
    data,
    type,
    created_at
  FROM tbl_list_count_tmp_data
  WHERE list_name = p_list_name AND type = p_type
  LIMIT p_page_size OFFSET v_offset;

  -- Optionally: return total count for frontend pagination
  SELECT COUNT(*) AS total_records
  FROM tbl_list_count_tmp_data
  WHERE list_name = p_list_name AND type = p_type;
END