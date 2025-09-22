const contactController = require('../Controller/contactfileController');
const integratedModuleModel = require('../Models/integratedModule.model');
const { verifyJwt } = require("../Controller/jwtAuth");
const baseService = require('../service/integrated_module_service/base');
const { filterDataByColumns } = require('../utils/dataFilter');
const { INTEGRATED_MODULE_ENUMS } = require('../service/integrated_module_service/base');

const IntegratedModuleController = {

  getModuleList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const modules = baseService.getModule();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  },

  storeToken: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const { module_id, token } = req.body;

      if(!module_id || !token) {
        return res.status(400).json({ message: 'Module ID and token are required' });
      }

      if(!Object.values(INTEGRATED_MODULE_ENUMS).includes(module_id)) {
        return res.status(400).json({ message: 'Invalid module ID', success: false });
      }

      const moduleId = module_id.replace('CYLSYS_', '').toLowerCase();
      const tokenService = require(`../service/integrated_module_service/${moduleId}_service/token_service`);

      const tokenValidation = await tokenService.validateToken(token);
      if(tokenValidation?.code !== 200) {
        return res.status(400).json({ message: 'Invalid token', success: false });
      }

      await integratedModuleModel.storeToken(module_id, token, userDetails);
      res.status(200).json({ message: 'Token stored successfully', success: true });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong. Please try again', success: false });
    }
  },

  getModule: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const { id } = req.params;

      if(!id) {
        return res.status(400).json({ message: 'Module ID is required', success: false });
      }

      if(!Object.values(INTEGRATED_MODULE_ENUMS).includes(id)) {
        return res.status(400).json({ message: 'Invalid module ID', success: false });
      }      

      const moduleId = id.replace('CYLSYS_', '').toLowerCase();
      const moduleService = require(`../service/integrated_module_service/${moduleId}_service/base_service`);
      const moduleList = moduleService.getModuleList();
      res.json(moduleList);
    } catch (error) {
      if(typeof error.code  === 'string') {
        error.code = 500;
      }
      const message = error.message || 'Failed to fetch module';
      res.status(error.code).json({ message: message, success: false });
    }
  },

  getFilters: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
          return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const { id, apiId } = req.params;

      if(!id || !apiId) {
        return res.status(400).json({ message: 'Module ID and API ID are required', success: false });
      }

      if(!Object.values(INTEGRATED_MODULE_ENUMS).includes(id)) {
        return res.status(400).json({ message: 'Invalid module ID', success: false });
      }

      const moduleId = id.replace('CYLSYS_', '').toLowerCase();
      const moduleApiId = apiId.toLowerCase();
      const moduleService = require(`../service/integrated_module_service/${moduleId}_service/${moduleApiId}_service`);
      const filters = await moduleService.getFilters(userDetails);
      res.json(filters);
    } catch (error) {
      if(typeof error.code  === 'string' || !error.code) {
        error.code = 500;
      }

      const message = error.message || 'Failed to fetch dropdown';
      res.status(error.code).json({ message: message, success: false });
    }
  },

  bulkInsert: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      }
      const { module_id, api_id, columns, list_name, status, source_id, list_id, let_it_be, replace, filters } = req.body;

      if(!module_id || !api_id) {
        return res.status(400).json({ message: 'Module ID and API ID are required', success: false });
      }

      if(!Object.values(INTEGRATED_MODULE_ENUMS).includes(module_id)) {
        return res.status(400).json({ message: 'Invalid module ID', success: false });
      }

      const moduleId = module_id.replace('CYLSYS_', '').toLowerCase();
      const moduleApiId = api_id.toLowerCase();
      const moduleService = require(`../service/integrated_module_service/${moduleId}_service/${moduleApiId}_service`);
      let fetchData = await moduleService.callApi(userDetails, filters);
      
      if(fetchData?.length === 0) {
        return res.status(200).json({message: "No data found", total: 0, success: true});
      }

      if(columns?.length > 0) {
        fetchData = filterDataByColumns(fetchData, columns);
      }

      const requestData = {
        list_name: list_name,
        status: status,
        source_id: source_id,
        list_id: list_id,
        let_it_be: let_it_be,
        replace: replace,
      }

      const fileOptions = {
        fileName: 'integrated_module_data',
        filePath: '',
        fileType: '',
      }

      if (list_id && status === "complete") {
        const validationResults = await contactController.updateBulkImport(fetchData, requestData, userDetails, fileOptions);
        res.status(200).json(validationResults);
      } else {
        const validationResults = await contactController.importContacts(fetchData, requestData, userDetails, fileOptions);
        if(status === "step_1") {
          const columns = Object.keys(fetchData[0]);
          res.status(200).json({...validationResults, columns: columns || [], success: true});
        } else {
          res.status(200).json({...validationResults, success: true});
        }
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Something went wrong. Please try again", success: false });
    }
  },

  validateToken: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      if (!userDetails) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
      } 

      const { module_ids } = req.body;
      if(!module_ids) {
        return res.status(400).json({ message: 'Module IDs are required', success: false });
      }

      const result = await baseService.validateToken(module_ids, userDetails);
      res.status(200).json({...result});
    } catch (error) {
      if(typeof error.code  === 'string' || !error.code) {
        error.code = 500;
      }

      console.log(error);

      const message = error.message || 'Failed to validate token';
      res.status(error.code).json({ message: message, success: false });
    }
  }

}

module.exports = IntegratedModuleController;


