CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_get_free_template_details_category`(
IN p_category_id int
)
BEGIN
			select 
            tt.template_id as template_id,
			tt.company_id as company_id,
			tt.raw_html as raw_html,
			tt.is_free as is_free,
			tt.category_id as category_id,
			tcm.category_name as category_name
			from tbl_template tt
			INNER JOIN 
			tbl_template_category_master tcm
			ON tt.category_id =tcm.id
			where is_free=1 AND tt.is_active=1
			AND (p_category_id = 1 OR category_id = p_category_id); 
                    
END