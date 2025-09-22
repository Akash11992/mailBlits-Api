const axios = require('axios');
const baseService = require('./base_service');
const { agent } = require('../base');

const CRMTokenService = {
    validateToken: async (token) => {
        try {
            const payload = {
                company_id: "@cylsys.com",
                type: "employee_list",
                token: token,
            }   
            const response = await axios.post(`${baseService.getBaseUrl()}/api/v1/validate-token`, payload, {
                httpsAgent: agent
            });
            if(response?.data?.valid) {
                return {
                    code: 200
                }
            }
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                message: error.message
            };
        }
    }
}

module.exports = CRMTokenService;