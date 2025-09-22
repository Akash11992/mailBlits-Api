DELIMITER //
 
CREATE TRIGGER  before_update_trigger_tbl_industry_type
BEFORE UPDATE ON mailblitzuat.tbl_industry_type
FOR EACH ROW
BEGIN
    INSERT INTO mailblitzuat_logs.tbl_industry_type_logs 
    SELECT * FROM tbl_industry_type WHERE idindustry_typ_id = OLD.idindustry_typ_id;
END; //

DELIMITER ;