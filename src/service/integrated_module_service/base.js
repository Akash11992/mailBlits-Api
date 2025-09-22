const fs = require('fs');
const integratedModuleModel = require('../../Models/integratedModule.model');
const https = require('https');

const agent = new https.Agent({
    keepAlive: true
});

const INTEGRATED_MODULE_ENUMS = {
    CYLSYS_CRM: 'CYLSYS_CRM',
    CYLSYS_HRMS: 'CYLSYS_HRMS',
}


const baseService = {
    getModule: () => {
        const masterData = fs.readFileSync('src/service/integrated_module_service/master.json', 'utf8');
        return JSON.parse(masterData);
    },

    validateToken: async (moduleIds, userDetails) => {

        try {
            if(moduleIds.length === 0) {
                throw new Error('No module ids provided');
            }
            const tokens = await integratedModuleModel.getAllTokens(moduleIds, userDetails.user_id);

            const result = await Promise.all(moduleIds.map(async moduleId => {

                if(Object.values(INTEGRATED_MODULE_ENUMS).includes(moduleId)) {
                    const moduleName = moduleId.replace('CYLSYS_', '').toLowerCase();
                    const module = require(`./${moduleName}_service/token_service`);
                    const data = tokens.find(token => token.module_id === moduleId);
                    
                    if(!data || !data.token) {
                        return {
                            [moduleId]: false
                        };
                    }

                    const response = await module.validateToken(data.token);
                    
                    if(response?.code === 200) {
                        return {
                            [moduleId]: true
                        };
                    }
                }
                return {
                    [moduleId]: false
                };
            }))

            return result.reduce((acc, curr) => {
                return {
                    ...acc,
                    ...curr
                };
            }, {});
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = baseService;

module.exports.agent = agent;

module.exports.INTEGRATED_MODULE_ENUMS = INTEGRATED_MODULE_ENUMS;