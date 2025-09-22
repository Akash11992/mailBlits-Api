const baseService = require('./base_service');
const integratedModuleModel = require('../../../Models/integratedModule.model');
const { INTEGRATED_MODULE_ENUMS } = require('../base');
const { replacePlaceholders } = require('./base_service');
const axios = require('axios');
const { agent } = require('../base');

const leadService = {
    getFilters: async (userDetails) => {
        try {
             const filterOption = [
                {
                    "label" : "From Date:",
                    "field_id": "from_date",
                    "type": "date",
                },
                {
                    "label" : "To Date:",
                    "field_id": "to_date",
                    "type": "date",
                },
                {
                    "label" : "Email Id",
                    "field_id": "email_id",
                    "type": "input"
                },
                {
                    "label" : "Lead Id",
                    "field_id": "lead_id",
                    "type": "input"
                },
                {
                    "label" : "BDM Name",
                    "field_id": "bdm_name",
                    "type": "dropdown",
                    "options": [],
                    "is_multiselect": true,
                    "data_source": {
                        "endpoint": `{{base_url}}/api/reports/GetBdmName?token={{token}}&appname=MailBlitz`,
                        "method": "GET"
                    }
                },
                {
                    "label" : "Lead Stage",
                    "field_id": "lead_stage",
                    "type": "dropdown",
                    "options": [],
                    "is_multiselect": true,
                    "data_source": {
                        "endpoint": `{{base_url}}/api/reports/GetDropDownList?token={{token}}&CategoryID=2&appname=MailBlitz`,
                        "method": "GET"
                    }
                },
                {
                    "label" : "Lead Action",
                    "field_id": "lead_action",
                    "type": "dropdown",
                    "options": [],
                    "is_multiselect": true,
                    "data_source": {
                        "endpoint": `{{base_url}}/api/reports/GetDropDownList?token={{token}}&CategoryID=1&appname=MailBlitz`,
                        "method": "GET"
                    }
                },
                {
                    "label" : "Lead Mail Action",
                    "field_id": "lead_mail_action",
                    "type": "dropdown",
                    "options": [],
                    "is_multiselect": true,
                    "data_source": {
                        "endpoint": `{{base_url}}/api/reports/GetDropDownList?token={{token}}&CategoryID=3&appname=MailBlitz`,
                        "method": "GET"
                    }
                },
                {
                    "label" : "Lead Vertical",
                    "field_id": "lead_vertical",
                    "type": "dropdown",
                    "options": [],
                    "is_multiselect": true,
                    "data_source": {
                        "endpoint": `{{base_url}}/api/reports/GetDropDownList?token={{token}}&CategoryID=4&appname=MailBlitz`,
                        "method": "GET"
                    }
                },
                {
                    "label" : "Country",
                    "field_id": "country",
                    "type": "dropdown",
                    "options": []
                },
                {
                    "label" : "State",
                    "field_id": "state",
                    "type": "dropdown",
                    "options": []
                },
                {
                    "label" : "City",
                    "field_id": "city",
                    "type": "dropdown",
                    "options": []
                }
             ]   

            const authData = await integratedModuleModel.getToken(INTEGRATED_MODULE_ENUMS.CYLSYS_CRM, userDetails.user_id);
        
            if(!authData || !authData.token) {
                throw new Error('Token not found');
            }

            const variables = {
                base_url: baseService.getBaseUrl(),
                token: authData.token,
            }

            const dropdownData = await Promise.all(filterOption.map(async (option) => {
                const { data_source, ...rest } = option;
                if(data_source && option.type === "dropdown") {
                    const endpoint = replacePlaceholders(data_source.endpoint, variables);
                    let response = null;
                    if(data_source?.method === "GET") {
                        response = await axios.get(endpoint, {
                            httpsAgent: agent
                        }).then((res) => {
                            if(res?.data?.length > 0) {
                                return res?.data?.map((item) => {
                                    return {
                                        id: item.ID,
                                        name: item.Name
                                    }
                                })
                            }
                            return []
                        });
                    } else if(data_source?.method === "POST") {
                        response = await axios.post(endpoint, variables).then(res => res.data);
                    }

                    return {
                        ...rest,
                        options: response || [],
                      };
                } 
                return option;
            }));
            return dropdownData;
        } catch (error) {
            throw error;
        }
    },

    callApi: async (userDetails, filters) => {
        try {
            const authData = await integratedModuleModel.getToken(INTEGRATED_MODULE_ENUMS.CYLSYS_CRM, userDetails.user_id);

            if(!authData || !authData.token) {
                throw new Error('Token not found');
            }

            let endpoint = `${baseService.getBaseUrl()}/api/reports/getLeads?start=&length=&searchText=&sortColumn=LeadID&sortDirection=asc&token=${authData.token}&companyId=2&appname=MailBlitz`;

            endpoint += `&fromDate=${ filters?.from_date ?? ''}`;
            endpoint += `&toDate=${ filters?.to_date ?? ''}`;
            endpoint += `&emailIdSearch=${ filters?.email_id ?? ''}`;
            endpoint += `&leadIdSearch=${ filters?.lead_id ?? ''}`;
            endpoint += `&BdmSearch=${ filters?.bdm_name ?? ''}`;
            endpoint += `&leadMailActionFilter=${ filters?.lead_mail_action ?? ''}`;
            endpoint += `&leadStageFilter=${ filters?.lead_stage ?? ''}`;
            endpoint += `&leadActionFilter=${ filters?.lead_action ?? ''}`;
            endpoint += `&lead_verticle=${ filters?.lead_vertical ?? ''}`;   
            endpoint += `&country=${ filters?.country ?? ''}`;
            endpoint += `&state=${ filters?.state ?? ''}`;
            endpoint += `&city=${ filters?.city ?? ''}`;
            const response = await axios.get(endpoint, {
                httpsAgent: agent
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = leadService;