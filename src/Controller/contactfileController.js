const { log } = require("handlebars");
const contactModel = require("../Models/contactfile.model");
const XLSX = require("xlsx");
const { verifyJwt } = require("../Controller/jwtAuth");
const dbConn = require("../../config/db.config").promise();
const { filterDataByColumns } = require("../utils/dataFilter");

const contactController = {
  addBulkdetails: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      // console.log("userDetails", userDetails);
      const newData = req.body;

      if (!newData.list_name) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "List name is required!",
        });
      }
      const excelFile = req.file;
      const workbook = XLSX.readFile(excelFile.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      let dataArray = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      dataArray.forEach((entry) => {
        for (const key in entry) {
          if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;
          const value = entry[key];
          if (typeof value === "number" && XLSX.SSF.is_date(value)) { 
            const date = XLSX.SSF.parse_date_code(value);
            entry[key] = new Date(Date.UTC(date.y, date.m - 1, date.d));
          }
        }
      });
      
      const fileOptions = {
        fileName: excelFile.originalname,
        filePath: excelFile.path,
        fileType: excelFile.mimetype,
      }

      const column_names = Object.keys(dataArray[0]);

      if(newData.columns?.length > 0 && newData.status === "complete") {
        const columns = JSON.parse(newData.columns);
        if(columns.length > 0) {
          dataArray = filterDataByColumns(dataArray, columns);
        }
      }

      const validationResults = await contactController.importContacts(dataArray, newData, userDetails, fileOptions);

      if(newData.status === "step_1") {
        res.status(200).json({ ...validationResults, columns: column_names });
      } else {
        res.status(200).json(validationResults);
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  importContacts: async (dataArray, newData, userDetails, options) => {
    try {
     // Clean tmp data first

     await contactModel.cleanListCountDetailsTmpData(newData.list_name, userDetails.user_id);
 
      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );

      let dataArr = validationResults[dataArray];
      let preview = validationResults.preview;
      const raw_data = [];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        
        for (let contact of validationResults.dataArray) {
          const { isvalidcontact, isDuplicatecontact, email_key, ...important_data } = contact;
          if (isvalidcontact && !isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              email_key
            );
            // console.log(contact.isvalidcontact);
            // console.log(result[0][0],result[0][0].response === 'exist');
            if (result[0][0].response === "exist") {
              raw_data.push({
                type: "exist",
                data: important_data
              })
              existingCount++;
            } else if (result[0][0].response === "new") {
              raw_data.push({
                type: "new",
                data: important_data
              })
              newCount++;
            }
          }
        }

        if(raw_data.length > 0) {
          await contactModel.saveCountInTmpTable(raw_data, newData.list_name, userDetails.user_id);
        }

        return {
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
          preview: preview,
        };
      } else if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
          options.fileName,
          options.filePath,
          options.fileType,
          userDetails.companyId,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          userDetails.user_id
        );
        // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        for (let contact of validationResults.dataArray) {
          // console.log(contact);
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            if (result[0][0].response === "exist") {
              existingCount++;
              // existingCount=result[1][0].existcount;
              // console.log("skipping existing contact",  result[1][0].existcount);
            } else if (result[0][0].response === "new") {
              // for (let contact of validationResults.dataArray) {
              //   // console.log(contact);
              //   if (contact.isvalidcontact && !contact.isDuplicatecontact) {
              // Filter out unwanted keys
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);
              // console.log("keys:", keys);
              // console.log("values:", values);

              newCount++;

            
              var resultSubmitted = await contactModel.addBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }

        // console.log("dataArray")
        // console.log(dataArray)

        console.log("ignoredCount", ignoredCount)
        console.log("dupEmailCount", dupEmailCount)
        console.log("existingCount", existingCount)


        let dataArr = dataArray.length;
        let totalValidationCount = ignoredCount + dupEmailCount + existingCount;

        let message = "Contact Details uploaded successfully!";
        let error = false;
        let success = true;
        if(ignoredCount === dataArr) {
          message = "Email column either not present or invalid!";
          error = true;
          success = false;
        }
        else if(dataArr === totalValidationCount) {
          message = "Contact Details already exists!";
        }

        return {
          success,
          error,
          message: message,
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        };
      }
    } catch (error) {
      console.log(error);
    }
  },

  getAllContacts: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      let list_id = req.body.list_id;
      let segment_id = req.body.segment_id;
      let page_number = req.body.page_number;

      // console.log(list_id, typeof list_id);
      const result = await contactModel.getAllContacts(
        userDetails,
        list_id,
        segment_id
      );
      // console.log(result[0]);
      // Transforming the data
      if (result[0]?.[0]?.response === 'fail') {
        res.json({
          success: true,
          error: false,
          message: "No Data found!",
          totalCount: 0,
          data: []
        });
      } else {
        const transformedData = result[0].map((item) => {
          const newItem = {
            // Extracting properties from contact_detail
            company_id: item?.company_id,
            contact_id: item?.contact_id,
            is_active: item?.is_active,
            created_at: item?.created_at,
            created_by: item?.created_by,
          };

          // Merging other properties
          if (item.contact_detail) {
            const contactDetail = item.contact_detail;

            // Dynamically add properties from contact_detail
            Object.keys(contactDetail).forEach((key) => {
              // Check if the key is not already present
              if (!(key in newItem)) {
                newItem[key] = contactDetail[key];
              }
            });
          } else {
            newItem.company_id = item.company_id;
          }

          return newItem;
        })
 // Filter out items where all properties are null
 .filter(
  (item) =>
    Object.values(item).some((value) => value !== null && value !== undefined)
);

        // console.log("transformedData",transformedData)
        // console.log(transformedData.length)
  
        res.json({
          success: true,
          error: false,
          message: "Details fetched successfully!",
          // totalCount: result[1][0].count,
          // data:transformedData
          totalCount: transformedData.length,
          data: transformedData,
        });
      }
    }
    catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  check_list: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      body = req.body;
      const result = await contactModel.check_list(userDetails, body);
      // console.log("res",result[0][0].response);
      if (result[0] && result[0][0]?.response === "fail") {
        res.status(400).json({
          success: false,
          error: true,
          message: "List name already exist!",
        });
      } else {
        res.json({ success: true, error: false, message: "yahoo,Go ahead!" });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getAllList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      body = req.body;
      const result = await contactModel.getAllList(userDetails, body);

      if (result[0] && result[0][0]?.response === "fail") {
        res.json({
          success: false,
          error: true,
          data: [],
          count: result[0].length,

        });
      } else {
        // console.log(``,result[0] );
        res.json({
          success: true,
          error: false,
          message: "List fetched successfully!",
          data: result[0],
          count: result[0].length,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateBulkdetails: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const newData = req.body;
      const excelFile = req.file;
      // console.log(excelFile);
      const workbook = XLSX.readFile(excelFile.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the worksheet to JSON format
      let dataArray = XLSX.utils.sheet_to_json(worksheet);

      const fileOptions = {
        fileName: excelFile.originalname,
        filePath: excelFile.path,
        fileType: excelFile.mimetype,
      }

      const column_names = Object.keys(dataArray[0]);

      if(newData.columns?.length > 0 && newData.status === "complete") {
        const columns = JSON.parse(newData.columns);
        if(columns.length > 0) {
          dataArray = filterDataByColumns(dataArray, columns);
        }
      }
      
      const response = await contactController.updateBulkImport(dataArray, newData, userDetails, fileOptions);

      if(newData.status === "step_1") {
        res.status(200).json({ ...response, columns: column_names });
      } else {
        res.status(200).json(response);
      }
      
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateBulkImport: async (dataArray, newData, userDetails, options) => {
    try {

      await contactModel.cleanListCountDetailsTmpData(newData.list_name, userDetails.user_id);

      // validateContact(dataArray, newData, userDetails);
      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      const raw_data = [];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          const { isvalidcontact, isDuplicatecontact, email_key, ...important_data } = contact;
          if (isvalidcontact && !isDuplicatecontact) {

            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            if (result[0][0].response === "exist") {
              existingCount++;
              raw_data.push({
                type: "exist",
                data: important_data
              })
            } else if (result[0][0].response === "new") {
              newCount++;
              raw_data.push({
                type: "new",
                data: important_data
              })
            }
          }
        }

        if(raw_data.length > 0) {
          await contactModel.saveCountInTmpTable(raw_data, newData.list_name, userDetails.user_id);
        }

        return {
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
          preview: preview,
        };
      } else if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
          options.fileName,
          options.filePath,
          options.fileType,
          userDetails.companyId,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          userDetails.user_id
        );
        // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        for (let contact of validationResults.dataArray) {

          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            // console.log("result[0][0].response",result[0][0].response);
            // console.log("req.body.replace",req.body.replace)
            // console.log("result[2]",result[2])

            if (
              result[0][0].response === "exist" &&
              newData.let_it_be === "1"
            ) {
              existingCount++;
              console.log("INSIDE - let it be");

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );

              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);

             
              await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );

            }
            if (result[0][0].response === "exist" && newData.replace === "1") {
              existingCount++;
              console.log("replace existing contact- replace");

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              for (let contactId of result[2]) {
                await contactModel.update_ReplaceBulkdetails(
                  newData,
                  contactId.contact_id,
                  contact.email_key,
                  userDetails,
                  filteredContact
                );
              }

            } else if (result[0][0].response === "new") {

              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);


              newCount++;
           
              await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }


        return {
          success: true,
          error: false,
          message: "Contact Details updated successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        };
        // }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  addMultipleContactInList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      // console.log("userDetails", userDetails);
      const newData = req.body;
      const dataArray = req.body.contacts;

      // validateContact(dataArray, newData, userDetails);
      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(contact.isvalidcontact);
            // console.log(result[0][0],result[0][0].response === 'exist');
            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }
        // console.log("Existing data count:", existingCount);
        // console.log("New data count:", newCount);
        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      } else if (newData.status === "complete") {
        for (let contact of validationResults.dataArray) {
          // console.log(contact);
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(result[0][0].response);
            if (result[0][0].response === "exist") {
              existingCount++;
              // existingCount=result[1][0].existcount;
              // console.log("skipping existing contact",  result[1][0].existcount);
            } else if (result[0][0].response === "new") {
              const Res_file_id = await contactModel.saveContactReview(
                null,
                 null,
                 null,
                 userDetails.companyId,
                 dataArray.length,
                 dupEmailCount,
                 existingCount,
                 ignoredCount + dupEmailCount,
                 newCount,
                 userDetails.user_id
               );
                // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
              // for (let contact of validationResults.dataArray) {
              //   // console.log(contact);
              //   if (contact.isvalidcontact && !contact.isDuplicatecontact) {
              // Filter out unwanted keys
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);
              // console.log("keys:", keys);
              // console.log("values:", values);

              newCount++;
              var resultSubmitted = await contactModel.addBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }
        // console.log(resultSubmitted);

        let dataArr = dataArray.length;
        let totalValidationCount = ignoredCount + dupEmailCount + existingCount;
        // console.log(dataArr, totalValidationCount);
        if (dataArr === totalValidationCount) {
          res.status(200).json({
            success: true,
            error: false,
            message: "Contact Details already exists!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        } else {
          res.json({
            success: true,
            error: false,
            message: "Contact Details uploaded successfully!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        }
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  updateMultipleContactInList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const newData = req.body;

      const dataArray = req.body.contacts;

      const validationResults = await validateContact(
        dataArray,
        newData,
        userDetails
      );
      let dataArr = validationResults[dataArray];
      let dupEmailCount = validationResults.duplicatContactCount;
      let ignoredCount = validationResults.invalidEmail;
      // console.log("...........", validationResults.dataArray);
      let existingCount = 0;
      let newCount = 0;

      if (newData.status === "step_1") {
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );
            // console.log(contact.isvalidcontact);
            // console.log(result[0][0],result[0][0].response === 'exist');
            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              newCount++;
            }
          }
        }
        // console.log("Existing data count:", existingCount);
        // console.log("New data count:", newCount);
        return res.json({
          success: true,
          error: false,
          message: "Count Fetched successfully!",
          dupEmailCount: dupEmailCount,
          ignoredCount: ignoredCount + dupEmailCount,
          reAddedContact: existingCount,
          newData: newCount,
          total: dataArray.length,
        });
      } else if (newData.status === "complete") {
        const Res_file_id = await contactModel.saveContactReview(
         null,
          null,
          null,
          userDetails.companyId,
          dataArray.length,
          dupEmailCount,
          existingCount,
          ignoredCount + dupEmailCount,
          newCount,
          userDetails.user_id
        );
        // console.log("Res_file_id",Res_file_id[0][0].contact_file_id)
        const contact_file_id = Res_file_id[0][0].contact_file_id;
        console.log("inside complete");
        for (let contact of validationResults.dataArray) {
          if (contact.isvalidcontact && !contact.isDuplicatecontact) {
            var result = await contactModel.validateConatctInListExistance(
              newData,
              userDetails,
              contact.email_key
            );

            // console.log("repsonse");
            // console.log(result[0][0].response);

            if (result[0][0].response === "exist") {
              existingCount++;
            } else if (result[0][0].response === "new") {
              const filteredContact = Object.fromEntries(
                Object.entries(contact).filter(
                  ([key]) =>
                    ![
                      "isvalidcontact",
                      "isDuplicatecontact",
                      "email_key",
                    ].includes(key)
                )
              );
              var keys = Object.keys(filteredContact);
              var values = Object.values(filteredContact);
              // console.log("keys:", keys);
              // console.log("values:", values);

              newCount++;
             
              var resultSubmitted = await contactModel.updateBulkdetails(
                newData,
                contact,
                contact.email_key,
                keys,
                values,
                userDetails,
                filteredContact,
                contact_file_id
              );
            }
          }
        }
        // console.log(resultSubmitted);

        let dataArr = dataArray.length;
        let totalValidationCount = ignoredCount + dupEmailCount + existingCount;
        // console.log(dataArr, totalValidationCount);
        if (dataArr === totalValidationCount) {
          res.status(400).json({
            success: true,
            error: false,
            message: "Contact Details already exists!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        } else {
          res.json({
            success: true,
            error: false,
            message: "Contact Details updated successfully!",
            dupEmailCount: dupEmailCount,
            ignoredCount: ignoredCount + dupEmailCount,
            reAddedContact: existingCount,
            newData: newCount,
            total: dataArray.length,
          });
        }
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteContact: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const contactIds = req.body.contact_ids;

      if (!contactIds || !Array.isArray(contactIds)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid or missing contact_ids",
        });
      }

      if (contactIds.length == 0) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Provide required fields",
        });
      }

      const contList = contactIds.join(",");

      const [rowList] = await dbConn.execute(
        `SELECT contact_id from tbl_email_scheduler_rule_for_campaign where contact_id IN (${contList}) and company_id=?`,
        [userDetails.companyId]
      );

      if (rowList.length > 0) {
        return res.status(400).send({
          message: "The Contact is actively being used in a campaign",
        });
      }

      await dbConn.execute(
        // `DELETE from tbl_contact_list_mapping where contact_id IN (${contList}) and company_id=?`,
        `UPDATE tbl_contact_list_mapping SET action='d', is_active=0 where contact_id IN (${contList}) and company_id=?`,

        [userDetails.companyId]
      );

      for (const contactId of contactIds) {
        await contactModel.deleteContact(contactId);
      }

      res.json({
        success: true,
        error: false,
        message: "Contacts deleted successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  saveContactToNewList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const contactIdList = req.body.contactIdList;
      const listName = req.body.listName;

      await contactModel.saveSelectedContactToNewList(
        contactIdList,
        listName,
        userDetails,
        res
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contacts saved to list successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  saveContactToList: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const contactIdList = req.body.contactIdList;
      const listId = req.body.listId;

      await contactModel.saveSelectedContactToList(
        contactIdList,
        listId,
        userDetails
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contacts saved to list successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  saveContactReview: async (req, res) => {
    try {

      const {
        p_file_id,
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_created_by
      } = req.body;


      await contactModel.saveContactReview(
        p_file_id,
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_created_by
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Contact review saved successfully!",
      });
    } catch (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  stopBulkdetails: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const excelFile = req.file;
      const workbook = XLSX.readFile(excelFile.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dataArray = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      let serialNum = 1;
      dataArray.forEach((entry) => {
        entry.serial_number = serialNum;
        serialNum ++;
        for (const key in entry) {
          if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;
          const value = entry[key];
          console.log(entry)
          if (typeof value === "number" && XLSX.SSF.is_date(value)) {
            const date = XLSX.SSF.parse_date_code(value);
            entry[key] = new Date(Date.UTC(date.y, date.m - 1, date.d));
          }
        }
      });

      await contactModel.bulkEmailStop(
        JSON.stringify(dataArray),
        userDetails.companyId,
        res
      );

      res.status(200).json({
        success: true,
        error: false,
        message: "Mail Stopped for selected contacts !",
      });

    } catch (err) {
      console.error("Error stopping mail :", err);
      res.status(500).json({ message: err.message });
    }
  },

  getCountPaginationDetails: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      let { list_name, type, page_number, page_size } = req.body;
      if(!list_name || !type || !page_number || !page_size) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Provide required fields",
        });
      }

      const allowed_types = ["new", "exist", "ignore", "duplicate", "all"];
      if(!allowed_types.includes(type)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid type",
        });
      }

      if(type === "ignore") {
        type = 'ignore,duplicate';
      }

      const result = await contactModel.getCountPaginationDetails(list_name, type, page_number, page_size, userDetails.user_id);
      
      let data = result[0];
      let total_count = result?.[1]?.[0]?.total_records || 0;
      if(data.length > 0) {
        data = data.map(item => {
          return item?.data || {}
        })
      }

      res.status(200).json({
        success: true,
        error: false,
        message: "Count fetched successfully!",
        data: {
          total_count: total_count,
          records: data
        }
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message, error: true });
    }
  }
};



const validateContact = async (dataArray, newData, userDetails) => {
  const emailSet = new Set();
  let returnObj = {};
  returnObj["duplicatContactCount"] = 0;
  returnObj["invalidEmail"] = 0;
  const raw_data = [];

  for (const dataObj of dataArray) {
    const important_data = {...dataObj};
    dataObj["isvalidcontact"] = false;
    dataObj["isDuplicatecontact"] = false;

    for (const email_key of Object.keys(dataObj)) {
      const email_value = dataObj[email_key];

      if (isEmail(email_value) && emailSet.has(email_value)) {
        raw_data.push({
          type: "duplicate",
          data: important_data
        });
        dataObj["isDuplicatecontact"] = true;
        dataObj["isvalidcontact"] = true;
        returnObj["duplicatContactCount"] =
          returnObj["duplicatContactCount"] + 1;
      }
      if (isEmail(email_value) && !emailSet.has(email_value)) {
        dataObj["isvalidcontact"] = true;
        dataObj["isDuplicatecontact"] = false;
        dataObj["email_key"] = email_value;
        // Mark email value as encountered to avoid duplicates
        emailSet.add(email_value);
      }
    }
    if (dataObj["isvalidcontact"] === false) {
      
      raw_data.push({
        type: "ignore",
        data: important_data
      })
      returnObj["invalidEmail"] = returnObj["invalidEmail"] + 1;
    }
  }
  returnObj["dataArray"] = dataArray;

  // save count in tmp table
  if(raw_data.length > 0) {
    await contactModel.saveCountInTmpTable(raw_data, newData.list_name, userDetails.user_id);
  }

  return returnObj;
};

function isEmail(str) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str);
}

function isEmailhas(value) {
  if (
    typeof value === "string" &&
    value.includes("@") &&
    !value.includes(".")
  ) {
    console.log("1", value);
  }
  if (
    typeof value === "string" &&
    value.includes(".") &&
    !value.includes("@")
  ) {
    console.log("2", value);
  }
}

module.exports = contactController;
