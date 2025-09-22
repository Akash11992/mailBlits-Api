DELIMITER //
CREATE TRIGGER before_insert_tbl_letter_heads
BEFORE INSERT ON  tbl_letter_heads
FOR EACH ROW
BEGIN
    DECLARE lastId INT;

    SELECT IFNULL(MAX(letter_head_id), 0) INTO lastId
    FROM  tbl_letter_heads;

    SET NEW.letter_head_id = lastId + 1;
END //

DELIMITER ;