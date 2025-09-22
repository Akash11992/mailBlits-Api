CREATE DEFINER=`root`@`%` PROCEDURE `sp_insert_contact_details`(

       IN p_company_id int,

    IN p_key text,

	IN p_value text,

IN p_created_by int,

p_contact_email TEXT,
p_contact_detail json

)
BEGIN

  DECLARE userExists INT;

        DECLARE p_user_id INT;

    DECLARE detailExists INT;

     DECLARE previous_id INT;

DECLARE new_id INT;



  

  



    SELECT COUNT(*) INTO userExists

        FROM tbl_contact

        WHERE email = p_contact_email AND company_id = p_company_id AND is_active = 1;
 
    

   

  



     IF (SELECT MAX(con_id) FROM tbl_contact_details) > 0 THEN

      

      SELECT MAX(con_id) INTO previous_id FROM tbl_contact_details;

      SET new_id = previous_id + 1;

    ELSE

      SET new_id = 1;

    END IF;

     IF userExists = 0 THEN

            

            INSERT INTO tbl_contact (company_id, email,contact_detail, is_active, created_by,updated_by)

            VALUES (p_company_id, p_contact_email,p_contact_detail, 1, p_created_by,p_created_by);

		end if;

      

            SELECT contact_id INTO p_user_id

            FROM tbl_contact

            WHERE email = p_contact_email AND company_id = p_company_id AND is_active = 1;
 
   INSERT INTO tbl_contact_details (

            con_id,

            con_company_id,

            user_id,

            `key`,

            `value`,

            con_is_active,

            con_created_by,
            con_updated_by
			) VALUES (

            new_id,

           p_company_id,

           p_user_id,

            p_key,

            p_value,

            1,

            p_created_by,
            p_created_by
        );

  SELECT 'success' as response;

 
 


END