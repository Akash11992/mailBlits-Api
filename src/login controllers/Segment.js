const dbConn = require('../../config/db.config').promise();

exports.CreateSegment = async (req, res, next) => {
  try {
    let [temp] = await dbConn.execute(
      "SELECT 1 FROM `sqm_reg_companies` WHERE `rc_id`=? AND rc_is_active=1 AND rc_is_deleted=0",
      [req.body.companyId],
    );

    if (temp.length === 0) {
      // return res.status(422).json({
      return res.status(400).send({
        message: "Invalid Company details provided in request",
        success: false,
        error: true
      });
    }
    temp = [];
    [temp] = await dbConn.execute(
      "SELECT 1 FROM `tbl_users` WHERE `user_id`=?",
      [req.body.userId],
    );
    if (temp.length === 0) {
      return res.status(400).send({
        message: "Invalid User details provided in request ",
        success: false,
        error: true
      });
    }
    const [rowFindUser] = await dbConn.execute('SELECT 1 FROM `sqm_segment` WHERE seg_name = ? AND seg_company_id = ? AND seg_user_id=? AND seg_is_active=1 AND seg_is_deleted=0',
     [req.body.segmentName,req.body.companyId, req.body.userId])
    if (rowFindUser?.length > 0) {
      return res.status(400).send({
        message: "Segment Name already exists",
        success: false,
        error: true
      });
    }

    console.log("Req body", JSON.stringify(req.body.condition));
    let condition= [];
    let conds = req.body.condition.split(",");
    conds.forEach((p) => {
      condition.push('"' + p + '"');
    })
    console.log("Condition:", condition)
    console.log("Condition2:", condition.toString())
    let findField = req.body.findField;
    if (findField.includes(" ")) {
      findField = JSON.stringify(findField);
    }
    const [rows] = await dbConn.execute(
      'call create_segment(?,?,?,?,?,?,?,?,?)',
      [
        req.body.companyId,
        req.body.userId,
        req.body.segmentName,
        findField,
        req.body.criteriaId,
        req.body.Is_Or,
        req.body.Is_And,
        req.body.userId,
        condition.toString(),
      ]);
condition = [];
    if (rows) {
      return res.status(201).json({
        success: true,
        error: false,
        message: "The Segment has been successfully inserted.",
        data: rows,
      });
    }
    return res.status(200).send({
      success: false,
      error: true,
      message: "Something went wrong while creating segment.",
    });
  }
  catch (err) {
    next(err);
  }
};

//------------------------------------------------------------------------------------------
exports.UpdateSegment = async (req, res, next) => {

  try {
    const [row] = await dbConn.execute(
      // "SELECT * FROM `users` WHERE `Email`=?",

      "SELECT * FROM `invite_users` WHERE `UserId`=?",
      [req.body.UserId],
    );

    if (row.length === 0) {
      // return res.status(422).json({
      return res.json({
        message: "Invalid UserId",
      });
    }
    const [row1] = await dbConn.execute(
      // "SELECT * FROM `company_ragistration` WHERE `company_Id`=?",
      'call sendquickmail_db.GetCompanyId(?)',
      [req.body.company_Id],

    );

    if (row1.length === 0) {
      // return res.status(422).json({
      return res.json({
        message: "Invalid company_Id ",
      });
    }

    const [rows] = await dbConn.execute(
      
      // "UPDATE tbl_segment SET `segmentName` = ?, `criteria` = ?, `contactfieldType` = ?, `FieldfindBy` = ?, `Is_And` = ?, `Is_Or` = ?, `contains` = ?,`segment_users`= ?, `IsActive` = ? ,`UserId` = ?,`company_Id` = ? WHERE `segment_Id` = ?",
      'call sendquickmail_db.Update_Segment(?,?,?,?,?,?,?,?,?,?,?,?)',

      [
        req.body.segmentName,
        req.body.criteria, 
        req.body.contactfieldType,
        req.body.FieldfindBy,
        req.body.Is_And, 
        req.body.Is_Or,
        req.body.contains,
        req.body.segment_users, 
        req.body.company_Id,
        req.body.UserId,
        req.body.IsActive,
        req.body.segment_Id
      ]);

    console.log('message', rows)


    // if (rows.affectedRows === 1) {
    //   return res.status(201).json({
    //     success: rows,
    //     message: "The Segment has been successfully Updated",
    //   });
    // }

    return res.json({
      success: true,
      message: "The Segment has been successfully Updated",
      data: rows,
    });

  }
  catch (err) {
    next(err);
  }
};

exports.GetSegmentbyId = async (req, res, next) => {
  try {
    console.log("execute....");
    const [row_a] = await dbConn.execute(
      "SELECT * FROM `tbl_segment` WHERE `segment_Id`= ?",
      // 'call sendquickmail_db.Get_SegmentbyId(?)',
      [req.body.segment_Id]
    );
    if (row_a.length > 0) {
      return res.json({
        success: "true",
        message: "segment Id matched Successfully",
        data: row_a[0],
      });
    } else {
      return res.json({
        status: 404,
        message: "Invalid segment Id ",
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};


exports.GetSegmentbyUserId = async (req, res, next) => {
  try {
    const [row_a] = await dbConn.execute(
      'SELECT seg_id AS id, seg_name AS name FROM `sqm_segment` WHERE seg_company_id=? AND seg_user_id=? AND seg_is_active=1 AND seg_is_deleted=0',
      [req.body.companyId, req.body.userId]
    );
    if (row_a) {
      if (row_a.length > 0) {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments fetched successfully",
          data: row_a,
        });
      } else {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments fetched successfully. No records found.",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        error: true,
        message: "Something went wrong while fetching Segments details."
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};

exports.GetSegmentCategoriesbyUserId = async (req, res, next) => {
  try {
    const [row_a] = await dbConn.execute(
        'call sqm_sp_getSegmentCategoryCompanywise(?)',
        [req.body.companyId]
    );
    if (row_a) {
      if (row_a.length > 0) {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments fetched successfully",
          data: row_a[0],
        });
      } else {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments fetched successfully. No records found.",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        error: true,
        message: "Something went wrong while fetching Segments details."
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};

exports.GetSegmentCriterias = async (req, res, next) => {
  try {
    const [row_a] = await dbConn.execute(
        'SELECT scm_id AS id, scm_name AS name FROM `sqm_segment_criteria_master` WHERE scm_is_active=1 AND scm_is_deleted=0',
    );
    if (row_a) {
      if (row_a.length > 0) {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments criteria fetched successfully",
          data: row_a,
        });
      } else {
        return res.status(200).send({
          success: true,
          error: false,
          message: "Segments criteria fetched successfully. No records found.",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        error: true,
        message: "Something went wrong while fetching Segments criteria details."
      });
    }
  } catch (err) {
    console.log("err...", err);
    next(err);
  }
};
