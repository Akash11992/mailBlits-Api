// unsubscribe.model.js

const pool = require('../../config/db.config');

const insertUnsubscribeData = (company_id, campaign_id, email, reason, created_by) => {
  return new Promise((resolve, reject) => {
    const sql = 'CALL sp_create_unsubscribe_data(?, ?, ?, ?, ?)';
    pool.query(sql, [company_id, campaign_id, email, reason, created_by], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  insertUnsubscribeData,
};
