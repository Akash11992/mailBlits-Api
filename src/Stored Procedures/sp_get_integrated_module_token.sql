CREATE PROCEDURE `sp_get_integrated_module_token`(IN p_module_id VARCHAR(25), IN p_created_by INT)
BEGIN
	select token from tbl_integrated_module_tokens where module_id = p_module_id and created_by = p_created_by;
END