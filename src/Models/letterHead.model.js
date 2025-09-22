const db = require("../../config/db.config");
const fs = require("fs");
const letterHeadModel = {
  createLetterHead: async (userDetails, body, file, imageUrl) => {
    try {
      //   let results = [];

      console.log("files array");
      console.log(file.length);

      // Insert rows for each file
      //   for (const file of files) {
      // try {
      //   let filepath = `${file.path}`;
      //   console.log("uploading", filepath);

      const fileResult = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_create_letter_head(?,?,?,?,?,?)",
          [
            userDetails.companyId,
            body.letter_head_name,
            file.originalname,
            file.mimetype,
            file.path,
            userDetails.user_id,
          ],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
      //   results.push(fileResult);
      // } catch (error) {
      //   console.error("Error inserting file:", error);
      // }
      //   }

      return fileResult;
    } catch (err) {
      throw err;
    }
  },
  getAllLetterHead: async (userDetails) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_letter_head(?)",
          [userDetails.companyId],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  DeleteLetterHead: async (userDetails,letter_head_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_delete_letter_head(?,?)",
          [userDetails.companyId,letter_head_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  get_by_id: async (userDetails,letter_head_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_letter_head_get_by_id(?,?)",
          [userDetails.companyId,letter_head_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  updateLetterHead: async (userDetails, body, file, imageUrl) => {
    try {
      //   let results = [];

      // console.log("files array");
      // console.log(file.length);

      // Insert rows for each file
      //   for (const file of files) {
      // try {
      //   let filepath = `${file.path}`;
      //   console.log("uploading", filepath);

      const fileResult = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_update_letter_head(?,?,?,?,?,?,?)",
          [
            userDetails.companyId,
            body.letter_head_id,
            body.letter_head_name,
            file.originalname,
            file.mimetype,
            file.path,
            userDetails.user_id,
          ],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
      //   results.push(fileResult);
      // } catch (error) {
      //   console.error("Error inserting file:", error);
      // }
      //   }

      return fileResult;
    } catch (err) {
      throw err;
    }
  },
  createHeader: async (userDetails,body) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_create_doc_header(?,?,?,?)",
          [userDetails.companyId,body.header_name,body.description,userDetails.user_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  createFooter: async (userDetails,body) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_create_doc_footer(?,?,?,?)",
          [userDetails.companyId,body.footer_name,body.description,userDetails.user_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getAllHeader: async (userDetails,headerId) => {
    console.log("headerId");
    console.log(headerId);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_header(?,?)",
          [userDetails.companyId,headerId],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  getAllFooter: async (userDetails,footerId) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_footer(?,?)",
          [userDetails.companyId,footerId],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
};
module.exports = letterHeadModel;
