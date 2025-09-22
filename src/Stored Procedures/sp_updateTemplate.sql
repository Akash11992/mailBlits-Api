CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_updateTemplate`(  IN p_company_id INT,in p_temp_id int,IN p_temp_name VARCHAR(125),p_raw_html text, in p_updated_by varchar(45), IN p_add_unsubscribe INT, IN p_list_id INT)
BEGIN
  update tbl_template set template_name=p_temp_name, raw_html=p_raw_html, created_by=p_updated_by, created_at=NOW(), action='u', add_unsubscribe=p_add_unsubscribe, list_id = p_list_id where template_id=p_temp_id and company_id=p_company_id and is_active=1;
  SELECT "success" AS response;
END