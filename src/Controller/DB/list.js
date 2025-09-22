const dbConn = require("../../../config/db.config").promise();
const { error } = require("pdf-lib");
const { verifyJwt } = require("../../Controller/jwtAuth");


exports.setListStatus= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    await dbConn.execute(
      "UPDATE tbl_list SET action='u',is_active=? where list_id=? and company_id=?",
      [req.body.isActive,req.body.listId,userDetails.companyId]);

      
      const [rowList] = await dbConn.execute(
        `SELECT contact_id FROM tbl_contact_list_mapping WHERE list_id=? AND company_id=?`,
        [req.body.listId, userDetails.companyId]
      );
      
      for (let cntct of rowList) {
      
        const [contactList] = await dbConn.execute(
          `SELECT contact_id FROM tbl_contact WHERE contact_id=? AND company_id=? and action!='d'`,
          [cntct.contact_id, userDetails.companyId]
        );
      
        if (contactList.length === 0) {
          console.log(`No contacts found for con_id: ${cntct.contact_id}`);
          continue; // Skip this iteration if no contacts are found
        }
      
        const contList = contactList.map(row => row.contact_id).join(",");
      
        if (contList) {
         
          
          await dbConn.execute(
            `UPDATE tbl_contact SET action='u',is_active=? WHERE contact_id IN (${contList}) AND company_id=?`,
            [req.body.isActive, userDetails.companyId]
          );
        }
      }
      
      return res.status(200).send({
        message: "List status updated!",
      });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}



exports.deleteList= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    if(typeof(req.body.listId) != 'object'){
      return res.status(400).send({
        message: 'Pass List of id'
      });
    }

    if(req.body.listId.length == 0){
      return res.status(400).send({
        message: 'Pass List id'
      });
    }

    for(let listId of req.body.listId){


      const [rowList] = await dbConn.execute(
        `SELECT contact_id from tbl_contact_list_mapping where list_id=? and company_id=?`,
        [listId,userDetails.companyId]);

  
        for(let cntct of rowList){
          
          const [rowList] = await dbConn.execute(
            `SELECT contact_id, camp.campaign_name from tbl_email_scheduler_rule_for_campaign sch JOIN tbl_campaign camp ON sch.campaign_id=camp.campaign_id where sch.contact_id=? and sch.company_id=? and camp.is_active=1 limit 1`,
            [cntct.contact_id,userDetails.companyId]);
  
            if(rowList.length > 0){
              return res.status(400).send({
                message: `The List is actively being used in ${rowList[0].campaign_name} campaign. Please delete the campaign and try again.`
              });
            }
        }

      const contList = rowList.map(row=>row.contact_id).join(",")
     
      await dbConn.execute(
        // "DELETE from tbl_contact_list_mapping where list_id=? and company_id=?",
        "update tbl_contact_list_mapping set `action`='d',is_active=0,created_at = NOW() where list_id=? and company_id=?",
        [listId,userDetails.companyId]);
  

        if(contList){
          await dbConn.execute(
            // `DELETE from tbl_contact where contact_id IN (${contList}) and company_id=?`,
            // `update tbl_contact  set action='d', is_active=0 where contact_id IN (${contList}) and company_id=?`,
            // [userDetails.companyId]);
            `update tbl_contact  set action='d', is_active=0,created_at = NOW() where contact_id IN (${contList}) and company_id=${userDetails.companyId}`);
        }
  
  
      await dbConn.execute(
        // "DELETE from tbl_list where list_id=? and company_id=?",
        "update tbl_list set action='d', is_active=0,created_at = NOW() where list_id=? and company_id=?",
        [listId,userDetails.companyId]);
    }

    return res.status(200).send({
      success:true,
      error:false,
      message: "List Deleted successfully !",
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}



exports.getContactByListId= async (req, res, next) => {

  try {
    const userDetails = verifyJwt(req);

    const [rowList] = await dbConn.execute(
      `SELECT tc.contact_id,tc.email,tc.contact_detail,tc.created_at AS createdAt from tbl_contact_list_mapping clm 
      INNER JOIN tbl_contact tc ON clm.contact_id=tc.contact_id
      where clm.list_id=? and clm.company_id=?`,
      [req.body.listId,userDetails.companyId]);


    return res.status(200).send({
      message: "List Contacts fetched!",
      data:rowList
    });


  } catch (err) {
    console.log("err...", err);
    return res.status(500).send({
      message: err.message
    });
  }
}