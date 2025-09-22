CREATE DEFINER=`sqmmysql`@`%` PROCEDURE `sqm_sp_getScheduler_Template_Document_DetailsByCampaignId`(p_company_id INT, p_campaign_id INT,p_option text)
BEGIN
    
    if p_option="template" then
     SELECT 
        camp.campaign_id,
        temp.tem_name as template_name,
        temp.raw_html as template_description
    FROM 
        tbl_campaign camp
     
    left JOIN 
        tbl_template temp ON temp.tem_company_id = p_company_id AND temp.tem_id = camp.content_template_id AND temp.tem_is_active = 1
   
    WHERE 
        camp.company_id = p_company_id AND camp.is_active = 1 And camp.campaign_id=p_campaign_id
    ORDER BY 
       camp.campaign_id DESC;
  end if;
  
     if p_option="document" then
      SELECT 
        camp.campaign_id,
        doc.doc_name as document_name,
        doc.description as document_description,
        doc.is_password_protected,
        doc.password_key,
        doc.doc_format_id,
        lh.letter_head_name as letterHeadName,
        lh.file_name as letterHeadFileName,
        lh.file_type as letterHEadType,
        lh.file_path as letterHeadPath,
        h.header_name as headerName,
        h.description as headerDescription,
        f.footer_name as footerName,
        f.description as footerDescription,
        tempattachdoc.attachment_name,
        tempattachdoc.attachment_type,
        tempattachdoc.attachment_path
    FROM 
        tbl_campaign camp
 
    left JOIN 
        tbl_atchmt_tmplt_mapping tempattachdoc ON tempattachdoc.company_id = p_company_id AND tempattachdoc.template_id = camp.content_template_id AND tempattachdoc.is_active = 1
    
    left JOIN 
        tbl_document doc ON doc.doc_company_id = p_company_id AND doc.doc_id = tempattachdoc.doc_id AND doc.is_active = 1
        
	left JOIN 
        tbl_letter_heads lh ON lh.letter_head_id = doc.letter_head_id AND lh.company_id = p_company_id AND lh.is_active = 1
	left JOIN 
        tbl_doc_header h ON h.header_id = doc.header_id AND h.company_id = p_company_id AND h.is_active = 1
    left JOIN 
        tbl_doc_footer f ON f.footer_id = doc.footer_id AND h.company_id = p_company_id AND h.is_active = 1
    WHERE 
        camp.company_id = p_company_id AND camp.is_active = 1 And camp.campaign_id=p_campaign_id
    ORDER BY 
       camp.campaign_id DESC;
     end if;
END