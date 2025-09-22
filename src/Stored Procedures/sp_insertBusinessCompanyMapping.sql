CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sp_insertBusinessCompanyMapping`(
IN businessId INT,
IN companyId  INT 

)
BEGIN
  INSERT INTO tblbusinesscompanyMapping (  businessId,   companyId ) VALUES ( businessId, companyId );

END