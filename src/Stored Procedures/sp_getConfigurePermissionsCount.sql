-- CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getConfigurePermissionsCount`(p_company_id int,p_role_id int)
-- BEGIN
-- if(Select count(*) from tbl_users where company_id = p_company_id and role_id=p_role_id and is_active=1 )>0
-- then
-- select r.role_name,count(u.role_id) as count from tbl_users u  inner join tbl_role_master r on r.company_id=u.company_id and r.role_id=u.role_id  where u.company_id=p_company_id and u.role_id=p_role_id and r.is_active=1 group by u.role_id,r.role_name;
--  select "success" as response;
-- else
-- select "fail" as response;
-- end if;
-- END


-- //..........new.............
CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_getConfigurePermissionsCount`(p_company_ids VARCHAR(255), p_role_ids VARCHAR(255))
BEGIN
    -- Create a temporary table to hold the results
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_counts (
        company_id INT,
        group_name VARCHAR(255),
        role_id INT,
        count INT
    );

    -- Use dynamic SQL to construct the query
    SET @sql = CONCAT(
        'INSERT INTO temp_counts (company_id, group_name, role_id, count)
        SELECT u.company_id, u.group_name, u.role_id, COUNT(role_id) AS count
        FROM tbl_users u
        WHERE u.company_id IN (', p_company_ids, ') 
        AND u.role_id IN (', p_role_ids, ') 
        AND u.is_active = 1
        GROUP BY u.company_id, u.group_name, u.role_id'
    );

    -- Prepare and execute the dynamic SQL
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Return the results
    SELECT * FROM temp_counts;

    -- Drop the temporary table
    DROP TEMPORARY TABLE IF EXISTS temp_counts;
END