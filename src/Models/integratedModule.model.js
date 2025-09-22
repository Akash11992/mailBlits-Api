const pool = require('../../config/db.config');

const integratedModuleModel = {
    storeToken: async (module_id, token, user_details) => {
    return new Promise((resolve, reject) => {
      const sql = 'CALL sp_store_integrated_module_token(?, ?, ?)';
      pool.query(sql, [module_id, token, user_details.user_id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    },

    getToken: async (module_id, user_id) => {
        return new Promise((resolve, reject) => {
            const sql = 'CALL sp_get_integrated_module_token(?, ?)';
            pool.query(sql, [module_id, user_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {    
                    resolve(result[0][0]);
                }
            });
        });
    },

    getAllTokens: async (module_ids, user_id) => {
        return new Promise((resolve, reject) => {
            const sql = 'CALL sp_get_all_integrated_module_tokens(?, ?)';
            pool.query(sql, [module_ids.join(','), user_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });
    },
};

module.exports = integratedModuleModel;

