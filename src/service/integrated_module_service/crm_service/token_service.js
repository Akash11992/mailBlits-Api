const axios = require('axios');
const baseService = require('./base_service');
const { agent } = require('../base');

const CRMTokenService = {
    validateToken: async (token) => {
        try {
            const response = await axios.get(`${baseService.getBaseUrl()}/api/ExternalApp/ValidateToken?token=${token}&appname=MailBlitz`, {
                httpsAgent: agent
            });
            return response.data;
        } catch (error) {
            return {
                code: 500,
                message: error.message
            };
        }
    }
}

module.exports = CRMTokenService;