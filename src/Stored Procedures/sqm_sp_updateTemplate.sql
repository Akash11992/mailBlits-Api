CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sqm_sp_updateTemplate`(  IN p_company_id INT,in p_temp_id int,IN p_temp_name VARCHAR(125),p_raw_html text, in p_updated_by varchar(45))
BEGIN
  update tbl_template set tem_name=p_temp_name, raw_html=p_raw_html,tem_updated_by=p_updated_by,created_at=current_timestamp() where tem_id=p_temp_id and tem_company_id=p_company_id and tem_is_active=1;
  SELECT "success" AS response;
END