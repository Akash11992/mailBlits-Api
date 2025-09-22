const dbConn = require("../../../config/db.config").promise();
const { log, select } = require("async");
const { verifyJwt } = require("../../Controller/jwtAuth");
const { validationResult } = require("express-validator");

exports.getTemplateAndDocument= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    let finalRows = [];

      let totalCount = 0;

    if(req.body.type == 'Emailer' || req.body.type == 'All'){
      const [rowList] = await dbConn.execute(
        "SELECT tmp.template_id AS templateId,tmp.created_at ,tmp.template_name as templateName,tmp.raw_html AS html,ru.full_name AS name, tmp.is_active AS isActive from tbl_template tmp INNER JOIN tbl_users ru ON tmp.created_by=ru.user_id and  ru.is_active=1 WHERE  tmp.is_active=1 and tmp.company_id=?  order by tmp.template_id desc",
        [userDetails.companyId]);

      for(let row of rowList){

        const [rowList] = await dbConn.execute(
          `SELECT td.doc_id,td.doc_name AS docName,td.description,td.is_password_protected,td.password_key,df.doc_format_id AS formatId,df.doc_format_type AS formatType,
          attachment_name as attachmentName,attachment_path as attachmentPath
          from tbl_attachment_template_mapping tam 
          INNER JOIN tbl_document td ON tam.doc_id=td.doc_id  and td.is_active=1
          INNER JOIN tbl_doc_format df ON df.doc_format_id=td.doc_format_id  and df.is_active=1
          where tam.template_id=? AND df.is_active=1 and tam.is_active=1`,
          [row.templateId]);
          row.docList = rowList;
          row.type = 'Emailer'
          totalCount = rowList.length;


          const [attachmentList] = await dbConn.execute(
            `SELECT attachment_name as attachmentName,attachment_path as attachmentPath
            from tbl_attachment_template_mapping tam 
            where tam.template_id=? and tam.attachment_name is not null  and tam.is_active=1`,
            [row.templateId]);
            row.attachmentList = attachmentList;
      }

      finalRows = finalRows.concat(rowList);

    }

    if(req.body.type == 'Document' || req.body.type == 'All'){

      const [rowList] = await dbConn.execute(
        `SELECT td.created_at,td.doc_id,td.doc_name AS docName,
        td.description,td.is_password_protected,td.password_key,df.doc_format_id AS formatId,
        df.doc_format_type AS formatType,ru.full_name as name,
        th.header_id as headerId, th.header_name as headerName,th.description as headerDescription,
        tf.footer_id as footerId,tf.footer_name as footerName,tf.description as footerDescription
        from tbl_document td
        INNER JOIN tbl_users ru ON td.created_by=ru.user_id and ru.action!='d' and ru.is_active=1
        INNER JOIN tbl_doc_format df ON df.doc_format_id=td.doc_format_id and  df.is_active=1
        LEFT JOIN tbl_doc_header th ON td.header_id = th.header_id and th.action!='d' and th.is_active=1
        LEFT JOIN tbl_doc_footer tf ON td.footer_id = tf.footer_id and tf.action!='d' and tf.is_active=1
        where td.company_id=? AND td.action!='d' AND td.is_active=1 order by doc_id desc`,
        [userDetails.companyId]);

        rowList.map(r=>r.type='Document')
        
        finalRows = finalRows.concat(rowList);
        totalCount = rowList.length;

    }

    if(req.body.type == 'Header' || req.body.type == 'All'){

      const [rowList] = await dbConn.execute(
        `SELECT th.header_id as headerId,th.header_name,th.description,th.created_at,ru.full_name as name
        from tbl_doc_header th
        INNER JOIN tbl_users ru ON th.created_by=ru.user_id and ru.is_active=1 and ru.action!='d'
        where th.company_id=? and th.action!='d' and th.is_active=1 order by header_id desc`,
        [userDetails.companyId]);

        rowList.map(r=>r.type='Header')
        
        finalRows = finalRows.concat(rowList);
        totalCount = rowList.length;

    }

    if(req.body.type == 'Footer' || req.body.type == 'All'){

      const [rowList] = await dbConn.execute(
        `SELECT tf.footer_id as footerId,tf.footer_name,tf.description,tf.created_at,ru.full_name as name
        from tbl_doc_footer tf
        INNER JOIN tbl_users ru ON tf.created_by=ru.user_id and ru.is_active=1 and ru.action!='d'
        where tf.company_id=? and tf.action!='d' and tf.is_active=1 order by footer_id desc`,
        [userDetails.companyId]);

        rowList.map(r=>r.type='Footer')
        
        finalRows = finalRows.concat(rowList);
        totalCount = rowList.length;
    }

    finalRows.sort((a,b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return res.status(200).send({
      message: "Data Fetched!",
      data: finalRows,
      totalCount:finalRows.length
    });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}





exports.getPreview= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    let finalRows = [];

    if(req.body.type == 'Emailer'){
      const [rowList] = await dbConn.execute(
        "SELECT tmp.template_id AS templateId ,tmp.template_name as templateName,tmp.raw_html AS html,ru.full_name AS name, tmp.created_at, tmp.add_unsubscribe, tmp.list_id from tbl_template tmp INNER JOIN tbl_users ru ON tmp.created_by=ru.user_id WHERE tmp.company_id=? AND tmp.template_id=? AND tmp.is_active=1 order by tmp.template_id desc",
        [userDetails.companyId,req.body.rowId]);

      for(let row of rowList){

        const [rowList] = await dbConn.execute(
          `SELECT td.doc_id,td.doc_name AS docName,td.description,td.is_password_protected,td.password_key,df.doc_format_id AS formatId,
          df.doc_format_type AS formatType,
          th.header_id as headerId, th.header_name as headerName,th.description as headerDescription,
          tf.footer_id as footerId,tf.footer_name as footerName,tf.description as footerDescription
          from tbl_attachment_template_mapping tam 
          INNER JOIN tbl_document td ON tam.doc_id=td.doc_id 
          INNER JOIN tbl_doc_format df ON df.doc_format_id=td.doc_format_id
          LEFT JOIN tbl_doc_header th ON td.header_id = th.header_id
          LEFT JOIN tbl_doc_footer tf ON td.footer_id = tf.footer_id 
          where tam.template_id=? AND df.is_active=1`,
          [row.templateId]);
          row.docList = rowList;
          row.type = 'Emailer'
      }

      for(let row of rowList){

        const [rowList] = await dbConn.execute(
          `SELECT mapping_id,attachment_name,attachment_type AS attchmntType,attachment_path as attachementPath
          from tbl_attachment_template_mapping
          where template_id=? AND is_active=1`,
          [row.templateId]);

          rowList.forEach((row)=>{
            if(row.attachementPath){
              let path =row.attachementPath;

              if (path) {
                path = path.replace(/\\/g, "/");
              }
              row.attachementPath = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}/${path}`;
              row.type = 'Attachment'
            }
          })

              // Filter out null values from attachments
    const filteredAttachments = rowList.filter(attachment => attachment.attachementPath !== null);

          row.AttachmentList = filteredAttachments;
      
      }

      finalRows = finalRows.concat(rowList);

    }

    if(req.body.type == 'Document'){

      const [rowList] = await dbConn.execute(
        `SELECT td.created_at,ru.full_name AS name,td.doc_id,td.doc_name AS docName,td.description,td.is_password_protected,td.password_key,df.doc_format_id AS formatId,df.doc_format_type AS formatType,
        th.header_id as headerId, th.header_name as headerName,th.description as headerDescription,
        tf.footer_id as footerId,tf.footer_name as footerName,tf.description as footerDescription, td.list_id
        from tbl_document td
        INNER JOIN tbl_users ru ON td.created_by=ru.user_id
        INNER JOIN tbl_doc_format df ON df.doc_format_id=td.doc_format_id
        LEFT JOIN tbl_doc_header th ON td.header_id = th.header_id
        LEFT JOIN tbl_doc_footer tf ON td.footer_id = tf.footer_id 
        where td.company_id=? AND df.is_active=1 AND td.doc_id=? order by doc_id desc`,
        [userDetails.companyId,req.body.rowId]);

        rowList.map(r=>r.type='Document')
        
        finalRows = finalRows.concat(rowList);
    }



    if(req.body.type == 'Header'){

      const [rowList] = await dbConn.execute(
        `SELECT header_name as headerName,description AS headerDescription
        from tbl_doc_header
        where company_id=? AND header_id=?`,
        [userDetails.companyId,req.body.rowId]);

        rowList.map(r=>r.type='Header')
        
        finalRows = finalRows.concat(rowList);
    }


    if(req.body.type == 'Footer'){

      const [rowList] = await dbConn.execute(
        `SELECT footer_name as footerName,description AS footerDescription
        from tbl_doc_footer
        where company_id=? AND footer_id=?`,
        [userDetails.companyId,req.body.rowId]);

        rowList.map(r=>r.type='Footer')
        
        finalRows = finalRows.concat(rowList);
    }

    return res.status(200).send({
      message: "Data Fetched!",
      data: finalRows,
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}




exports.CloneTemplate = async (req, res, next) => {
  try {

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Required fields missing!' });
  }

  const userDetails = verifyJwt(req);

  const [existingTemplate] = await dbConn.execute(
    "SELECT template_id AS templateId ,template_name as templateName,raw_html AS html, list_id from tbl_template WHERE company_id=? and template_id=?",
    [userDetails.companyId,req.body.templateId]
  );

  if (existingTemplate.length == 0) {
    return res.status(400).send({
      message: "No Template Found!",
    });
  }

  const template = existingTemplate[0];

  console.log("template...", template);

  const [roleRow] = await dbConn.execute(
    `INSERT INTO tbl_template (template_name, raw_html, company_id,created_by,action,is_active, list_id)
     SELECT ?, ?, ?, ?,'c',1, ?
     FROM dual
     WHERE NOT EXISTS (
       SELECT 1
       FROM tbl_template
       WHERE template_name = ? AND company_id = ?
     )`,
    [template.templateName+"_copy",template.html, userDetails.companyId, userDetails.user_id, template.list_id, template.templateName+"_copy", userDetails.companyId]
  );
  
    
  if (roleRow.affectedRows == 0) {
    return res.status(400).send({
      message: "Template clone already exists!!",
    });
  }


  const [existingTemplateAttchmtDocumentList] = await dbConn.execute(
    "SELECT doc_id,attachment_name,attachment_type,attachment_path from tbl_attachment_template_mapping WHERE template_id=? and company_id=?",
    [req.body.templateId,userDetails.companyId]
  );


  console.log(existingTemplateAttchmtDocumentList)


  if(existingTemplateAttchmtDocumentList.length >0){

    for(let tmplt of existingTemplateAttchmtDocumentList){
        await dbConn.execute(
        `INSERT INTO tbl_attachment_template_mapping (company_id, template_id, doc_id,attachment_name,attachment_path,action,is_active)
         VALUES(?, ?, ?, ?, ?,'c',1)`,
        [userDetails.companyId,roleRow.insertId,tmplt.doc_id, tmplt.attachment_name, tmplt.attachment_path]
      );
    }
  
  }
    
  return res.status(200).send({
    message: "Emailer Cloned Successfully!"
  });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};




exports.CloneDocument = async (req, res, next) => {
  try {

  const userDetails = verifyJwt(req);


  if(!req.body.docId){
    return res.status(400).send({
      message: "Provide required fields !",
    });
  }
  
console.log("here")
  const [existingDocument] = await dbConn.execute(
    "SELECT doc_name,header_id,footer_id,description,doc_format_id,is_password_protected,password_key,created_by,company_id,list_id from tbl_document WHERE doc_id=?",
    [req.body.docId]
  );

  if (existingDocument.length == 0) {
    return res.status(400).send({
      message: "No Template Found!",
    });
  }

  const document = existingDocument[0];

  console.log("2")

  await dbConn.execute(
    `INSERT INTO tbl_document (doc_name, description, doc_format_id,is_password_protected,password_key,created_by,company_id,action,is_active,header_id,footer_id, list_id)
    VALUES (?, ?, ?, ?, ?,?,?,'c',1,?,?,?)`,
    [document.doc_name+"_copy",document.description, document.doc_format_id, document.is_password_protected, document.password_key, document.created_by,document.company_id,document.header_id,document.footer_id, document.list_id]
  );
  

  return res.status(200).send({
    message: "Document Cloned Successfully!"
  });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};



exports.EditDocument = async (req, res, next) => {
  try {

  const userDetails = verifyJwt(req);


  if(!req.body.docId || !req.body.docName || !req.body.description || !req.body.formatId || req.body.isPasswordProtected == undefined 
    || req.body.isPasswordProtected == null ){
    return res.status(400).send({
      message: "Provide required fields 1!",
    });
  }


  if((req.body.isPasswordProtected && req.body.isPasswordProtected != undefined && req.body.isPasswordProtected != null) ){
    if(req.body.passwordKey == undefined || req.body.passwordKey == null || req.body.passwordKey.length == 0  ){

      return res.status(400).send({
        message: "Provide required fields !2",
      });
    }
  }
  

  const [existingDocument] = await dbConn.execute(
    "SELECT doc_name from tbl_document WHERE doc_id=? and is_active=1",
    [req.body.docId]
  );

  if (existingDocument.length == 0) {
    return res.status(400).send({
      message: "No Template Found!",
    });
  }
console.log(req.body.passwordKey);
if(req.body.passwordKey==undefined || req.body.passwordKey==null ||req.body.passwordKey.length == 0){
  req.body.passwordKey=null
}

const list_id = req.body.list_id ?? null;

  await dbConn.execute(
    `UPDATE tbl_document SET doc_name=?,description=?,doc_format_id=?,is_password_protected=?,password_key=?,header_id=?,footer_id=?, list_id=?, action='u',created_at = NOW() WHERE doc_id=?`,
    [req.body.docName,req.body.description, req.body.formatId, req.body.isPasswordProtected, req.body.passwordKey,req.body.headerId,req.body.footerId,list_id,req.body.docId]
  );
  

  return res.status(200).send({
    message: "Document updated Successfully!"
  });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};



exports.EditHeader = async (req, res, next) => {
  try {

  const userDetails = verifyJwt(req);

  if(!req.body.headerId || !req.body.headerName || !req.body.headerDescription){
    return res.status(400).send({
      message: "Provide required fields !",
    });
  }
  
  const [existingDocument] = await dbConn.execute(
    "SELECT header_id from tbl_doc_header WHERE header_id=? and company_id=?",
    [req.body.headerId,userDetails.companyId]
  );

  if (existingDocument.length == 0) {
    return res.status(400).send({
      message: "No Header Found!",
    });
  }

  await dbConn.execute(
    `UPDATE tbl_doc_header SET header_name=?,description=?,created_by=?,created_at=NOW(),action='u' WHERE header_id=?`,
    [req.body.headerName,req.body.headerDescription,userDetails.user_id, req.body.headerId]
  );
  
  return res.status(200).send({
    message: "Header updated Successfully!"
  });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};



exports.EditFooter = async (req, res, next) => {
  try {

  const userDetails = verifyJwt(req);


  if(!req.body.footerId || !req.body.footerName || !req.body.footerDescription){
    return res.status(400).send({
      message: "Provide required fields !",
    });
  }
  

  const [existingDocument] = await dbConn.execute(
    "SELECT footer_id from tbl_doc_footer WHERE footer_id=? and company_id=?",
    [req.body.footerId,userDetails.companyId]
  );

  if (existingDocument.length == 0) {
    return res.status(400).send({
      message: "No Footer Found!",
    });
  }

  await dbConn.execute(
    `UPDATE tbl_doc_footer SET footer_name=?,description=?,action='u',created_by=?,created_at=NOW() WHERE footer_id=?`,
    [req.body.footerName,req.body.footerDescription,userDetails.user_id, req.body.footerId]
  );
  
  return res.status(200).send({
    message: "Footer updated Successfully!"
  });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};





exports.DeleteTemplate = async (req, res, next) => {
  try {

    if(!req.body.templateId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }


  const userDetails = verifyJwt(req);

  await dbConn.execute(
    "CALL sp_Delete_template(?,?)",
    [req.body.templateId,userDetails.companyId]
  );


  return res.status(200).send({
    message: "Template Deleted Successfully!"
  });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};



exports.DeleteHeader = async (req, res, next) => {
  try {

    if(!req.body.headerId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

  const userDetails = verifyJwt(req);

/*
  await dbConn.execute(
    `UPDATE tbl_document SET header_id=NULL WHERE header_id=? and company_id=?`,
    [req.body.headerId,userDetails.companyId]
  );
*/
const [exist]=await dbConn.execute(
  `select count(*) as count from tbl_document WHERE header_id=? and company_id=? and is_active=1`,
  [req.body.headerId,userDetails.companyId]
);
console.log(exist[0])
if(exist[0]?.count>0){
  return res.status(400).send({
    error:true,
    success:false,
    message: "This header already in use!"
  });
}else{
  await dbConn.execute(
    // `DELETE from tbl_doc_header WHERE header_id=? and company_id=?`,
    `update tbl_doc_header set action='d',is_active=0,created_at = NOW() WHERE header_id=? and company_id=?`,
    [req.body.headerId,userDetails.companyId]
  );
  return res.status(200).send({
    error:false,
    success:true,
    message: "Header Deleted Successfully!"
  });
}
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};


exports.DeleteFooter = async (req, res, next) => {
  try {

    if(!req.body.footerId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

  const userDetails = verifyJwt(req);

/*
  await dbConn.execute(
    `UPDATE tbl_document SET footer_id=NULL WHERE footer_id=? and company_id=?`,
    [req.body.footerId,userDetails.companyId]
  );
*/
const [exist]=await dbConn.execute(
  `select count(*) as count from tbl_document WHERE footer_id=? and company_id=? and is_active=1`,
  [req.body.footerId,userDetails.companyId]
);
console.log(exist[0])
if(exist[0]?.count>0){
  return res.status(400).send({
    error:true,
    success:false,
    message: "This footer already in use!"
  });
}else{

  await dbConn.execute(
    // `DELETE from tbl_doc_footer WHERE footer_id=? and company_id=?`,
    `update tbl_doc_footer set action='d',is_active=0,created_at = NOW() WHERE footer_id=? and company_id=?`,

    [req.body.footerId,userDetails.companyId]
  );

  return res.status(200).send({
    error:false,
    success:true,
    message: "Footer Deleted Successfully!"
  });
}
  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};



exports.DeleteDocument = async (req, res, next) => {
  try {

    if(!req.body.documentId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }

  const userDetails = verifyJwt(req);

  await dbConn.execute(
   // `DELETE FROM tbl_atchmt_tmplt_mapping WHERE doc_id =?`,
   `update tbl_attachment_template_mapping set action='d',is_active=0,created_at = NOW() where doc_id =?`,
    [req.body.documentId]
  );


  await dbConn.execute(
   // `DELETE FROM tbl_document WHERE doc_id=?`,
    `update tbl_document set action='d',is_active=0,created_at = NOW() where doc_id =?`,

    [req.body.documentId]
  );


  return res.status(200).send({
    message: "Document Deleted Successfully!"
  });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};




exports.EditTemplate = async (req, res, next) => {
  try {

  const userDetails = verifyJwt(req);

    if(!req.body.templateId){
      return res.status(400).send({
        message: "Invalid request !",
      });
    }


  await dbConn.execute(
    "CALL sp_Delete_template(?,?)",
    [req.body.templateId,userDetails.companyId]
  );


  return res.status(200).send({
    message: "Template Deleted Successfully!"
  });

  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      success: true,
      error: false,
      message: err.message
    });
  }
};