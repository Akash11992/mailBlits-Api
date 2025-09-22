const baseService = require('./base_service');
const integratedModuleModel = require('../../../Models/integratedModule.model');
const { INTEGRATED_MODULE_ENUMS } = require('../base');
const { replacePlaceholders } = require('./base_service');
const axios = require('axios');
const { agent } = require('../base');

const EmployeeService = {
    getFilters: async (userDetails) => {
        try {
             const filterOption = [
                {
                    "label" : "Location",
                    "field_id": "location_id",
                    "type": "dropdown",
                    "options": []
                },
                {
                    "label" : "Role",
                    "field_id": "role_id",
                    "type": "dropdown",
                    "options": []
                },
                {
                    "label" : "Designation",
                    "field_id": "designation_id",
                    "type": "dropdown",
                    "options": []
                }
             ]

            const endpoint = `${baseService.getBaseUrl()}/api/v1/get-filters-for-employees-api?company_id=@cylsys.com`;

            const response = await axios.get(endpoint, {
                httpsAgent: agent
            });

            const { data: { filters } } = response.data;
            if(!filters) {
                throw new Error('No data found');
            }

            const { location, role, designation } = filters;

            filterOption.forEach(option => {
                if(option.field_id === 'location_id') {
                    option.options = location;
                } else if(option.field_id === 'role_id') {
                    option.options = role;
                } else if(option.field_id === 'designation_id') {
                    option.options = designation;
                }
            });
            return filterOption;
        } catch (error) {
            throw error;
        }
    },

    callApi: async (userDetails, filters) => {
        try {
            const authData = await integratedModuleModel.getToken(INTEGRATED_MODULE_ENUMS.CYLSYS_HRMS, userDetails.user_id);

            if(!authData || !authData.token) {
                throw new Error('Token not found');
            }

            let endpoint = `${baseService.getBaseUrl()}/api/v1/employees/list`;
            const payload = {
                token: authData.token,
                location: filters.location_id || null,
                role: filters.role_id || null,
                desgnation: filters.designation_id || null
            }
            const response = await axios.post(endpoint, payload, {
                httpsAgent: agent
            });
            const { data } = response.data;
            return data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EmployeeService;