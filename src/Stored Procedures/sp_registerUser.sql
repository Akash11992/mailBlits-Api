CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_registerUser`(
    p_name VARCHAR(100),
    p_email VARCHAR(300),
    p_password text,
    p_designation INT,
    p_phone VARCHAR(13),
	p_is_individual TINYINT,
    p_action VARCHAR(1)
)
BEGIN
    DECLARE new_user_id INT;
        -- Calculate the next available user_id if no active record exists
        SELECT IFNULL(MAX(user_id), 0) + 1 INTO new_user_id FROM `tbl_users`;
    
    -- Insert the new user record (or new version of existing user)
    INSERT INTO `tbl_users`(
        `user_id`,
        `full_name`,
        `email`,
        `password`,
        `designation`,
        `is_individual`,
        `phone_number`,
        `action`,
        `is_active`
    )
    VALUES (
        new_user_id,
        p_name,
        p_email,
        p_password,
        p_designation,
        p_is_individual,
        p_phone,
        p_action,
        1  -- Set new record as active
    );
    
    update tbl_users set created_by=new_user_id where user_id=new_user_id and is_active=1;
    select new_user_id as insertedId;
END