CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_createTemplate`(  IN p_company_id INT,IN p_temp_name VARCHAR(125),p_raw_html text, in p_created_by varchar(45), in p_add_unsubscribe INT, in p_list_id INT)
BEGIN
    DECLARE templateExists INT;

 SELECT COUNT(*) INTO templateExists
    FROM tbl_template
    WHERE template_name = p_temp_name AND company_id = p_company_id AND is_active = 1;

    IF templateExists > 0 THEN
        SELECT "fail" AS response;
        else
  INSERT INTO tbl_template (company_id, template_name, raw_html, is_active, created_by,action, add_unsubscribe, list_id)
        VALUES (p_company_id, p_temp_name, p_raw_html, 1, p_created_by, 'c', p_add_unsubscribe, p_list_id);
      SELECT "success" AS response;
        end if;
END