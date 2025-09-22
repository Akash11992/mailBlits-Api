DELIMITER //
CREATE TRIGGER before_insert_tbl_segments
BEFORE INSERT ON  tbl_segments
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(segments_id), 0) INTO lastId
    FROM  tbl_segments;

    SET NEW.segments_id = lastId + 1;
END //

DELIMITER ;