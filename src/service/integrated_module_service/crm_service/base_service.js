const dotenv = require('dotenv');
dotenv.config();

const baseService = {
    getBaseUrl: () => {
        return process.env.ENVIRONMENT === 'production' ? 'https://crmapis.cylsys.com' :  'https://crmuatapis.cylsysuat.com';
    },

    getModuleList: () => {
        return [
            {
                "id": "Lead",
                "name": "Leads"
            }
        ]
    },

    replacePlaceholders: (str, variables) => {
        return str.replace(/{{(.*?)}}/g, (match, p1) => variables[p1] || match);
    }
}

module.exports = baseService;