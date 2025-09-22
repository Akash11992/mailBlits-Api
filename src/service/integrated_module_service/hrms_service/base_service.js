const dotenv = require('dotenv');
dotenv.config();

const baseService = {
    getBaseUrl: () => {
        return process.env.ENVIRONMENT === 'production' ? 'https://hrmsapis.cylsys.com' :  'https://angularhrms_api.cylsysuat.com';
    },

    getModuleList: () => {
        return [
            {
                "id": "Employee",
                "name": "Employees"
            }
        ]
    },

    replacePlaceholders: (str, variables) => {
        return str.replace(/{{(.*?)}}/g, (match, p1) => variables[p1] || match);
    }
}

module.exports = baseService;