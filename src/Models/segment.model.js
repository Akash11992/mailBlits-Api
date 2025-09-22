// segment.model.js

const db = require('../../config/db.config');
const SegmentModel = {};

SegmentModel.insertOrUpdateSegment =async (body,userDetails,callback) => {
    // console.log('Callback:', body); // Log callback parameter for debugging
//   console.log(userDetails,"ll");
    const Criteria = JSON.stringify( body.quantities)
    // console.log(Criteria);

   const CreteriaQueryResult =await generateQuery(Criteria,userDetails.companyId)

    db.query('CALL sp_create_segment(?, ?, ?, ?,?,?)', [userDetails.companyId,body.segment_Name,Criteria,CreteriaQueryResult,1,userDetails.user_id], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            if (typeof callback === 'function') {
                callback(err); // Call callback with error if it's a function
            }
        } else {
            if (typeof callback === 'function') {
                callback(null, result); // Call callback with result if it's a function
            }
        }
    });
};


SegmentModel.getAllOptionsSegments = (callback) => {
    db.query('CALL sp_get_all_optionsForSegment()', (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};


SegmentModel.getSegmentsByCompanyId = (company_id, callback) => {
    console.log(company_id.companyId,);
    db.query('CALL sp_getSegmentsByCompanyId(?)', [company_id.companyId], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};


SegmentModel.SegmentsBydelete = (company_id,id, callback) => {
    console.log(company_id.companyId,id);
    db.query('CALL sp_deleteSegmentsByCompanyIdAndSegmentId(?,?)', [company_id.companyId,id], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};

SegmentModel.SegmentsByupdate = async (company_id, id, body,data,userDetails, callback) => {
    const Criteria = JSON.stringify(body.quantities);

    // console.log(Criteria);

    const CreteriaQueryResult =await generateQuery(Criteria,userDetails.companyId)

    // const companyId = company_id.companyId;
    // console.log(body);
    console.log(CreteriaQueryResult);
   db.query('CALL sp_updateSegmentBySegmentsIdAndCompanyId(?,?,?,?,?,?)', [id.id,company_id,body.segment_Name,data,CreteriaQueryResult,userDetails.user_id], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};

SegmentModel.SegmentsByidget = (company_id,id, callback) => {
    console.log(company_id.companyId,id);

    db.query('CALL sp_GetSegmentsByIDAndCompany(?,?)', [id,company_id.companyId,], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result[0]);
    });
};
function generateQuery(segmentCriteriaString,company_id) {
    let equalityGroups = {};
    let inequalityGroups = {};
// Parse the JSON string into an array of objects
const segmentList = JSON.parse(segmentCriteriaString);
    segmentList.forEach(segment => {
        if (segment.contains === "=") {
            if (!equalityGroups[segment.segment_type]) {
                equalityGroups[segment.segment_type] = [];
            }
            equalityGroups[segment.segment_type].push(segment.segmentvalue);
        } else if (segment.contains === "!=") {
            if (!inequalityGroups[segment.segment_type]) {
                inequalityGroups[segment.segment_type] = [];
            }
            inequalityGroups[segment.segment_type].push(segment.segmentvalue);
        }
    });

    let queryParts = [];

    for (let type in equalityGroups) {
        let values = equalityGroups[type];
        if (values.length > 1) {
            queryParts.push(`JSON_VALUE(contact_detail, '$.${type}') IN ('${values.join("','")}')`);
        } else {
            queryParts.push(`JSON_VALUE(contact_detail, '$.${type}') = '${values[0]}'`);
        }
    }

    for (let type in inequalityGroups) {
        queryParts.push(`JSON_VALUE(contact_detail, '$.${type}') NOT IN ('${inequalityGroups[type].join("','")}')`);
    }

    let finalQuery = `SELECT * FROM tbl_contact WHERE company_id=${company_id} AND ` + queryParts.join(" AND ");

    return finalQuery;
}


// console.log(generateQuery(segmentList));

module.exports = SegmentModel;
