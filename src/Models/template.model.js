const { log } = require("handlebars/runtime");
const db = require("../../config/db.config");
const fs = require("fs");
const templatetModel = {
  getAllRunningVariable: async (userDetails, body) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getAllRunningVariables(?,?)",
          [userDetails.companyId, body.list_id],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log(result);
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

  // createTemplate: async (userDetails,body,files) => {
  //   try {
  //     const result = await new Promise((resolve, reject) => {
  //       // console.log("cid...",userDetails.companyId,body,file);
  //        // Iterate through files and perform insertion for each file
  //        console.log(body.doc_id);
  //        files.forEach(file => {
  //         db.query(
  //           "CALL sp_create_attachment_template_mapping(?,?,?,?,?,?,?)",
  //           [userDetails.companyId,body.template_name,body.description,file.originalname,file.mimetype,file.path,userDetails.user_id],
  //           (err, result) => {
  //             if (err) {
  //               console.error(err);
  //               reject(err);
  //             } else {
  //               // console.log(result);
  //               resolve(result);
  //             }
  //           }
  //         );
  //        });
  //        db.query(
  //         "CALL sqm_create_doc_template_mapping(?,?,?,?,?)",
  //         [userDetails.companyId,body.template_name,body.description,body.doc_id,userDetails.user_id],
  //         (err, result) => {
  //           if (err) {
  //             console.error(err);
  //             reject(err);
  //           } else {
  //             // console.log(result);
  //             resolve(result);
  //           }
  //         }
  //       );
  //     });

  //     return result;
  //   } catch (err) {
  //     throw err;
  //   }
  // },

  createTemplate: async (userDetails, body, files, imageUrl) => {
    try {
      let results = [];

      // console.log("files array");
      // console.log(files.length);

      // Insert rows for each file
      for (const file of files) {
        try {
          let filepath = `${file.path}`;
          console.log("uploading", filepath);

          const fileResult = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_create_attachment_template_mapping(?,?,?,?,?,?)",
              [
                userDetails.companyId,
                body.template_name,
                file.originalname,
                file.mimetype,
                filepath,
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
          results.push(fileResult);
        } catch (error) {
          console.error("Error inserting file:", error);
        }
      }

      // Insert rows for each doc_id
      // console.log(body.doc_id,typeof body.doc_id);
      // for (const docId of body.doc_id) {
      //     try {
      //       console.log("docId..........",docId,typeof docId);
      //         const docIdResult = await new Promise((resolve, reject) => {
      //             db.query(
      //                 "CALL sqm_create_doc_template_mapping(?,?,?,?)",
      //                 [userDetails.companyId, body.template_name, docId, userDetails.user_id],
      //                 (err, result) => {
      //                     if (err) {
      //                         console.error(err);
      //                         reject(err);
      //                     } else {
      //                         resolve(result);
      //                     }
      //                 }
      //             );
      //         });
      //         results.push(docIdResult);
      //     } catch (error) {
      //         console.error("Error inserting doc_id:", error);
      //     }
      // }
      const docIds = body.doc_id.split(",").map((id) => parseInt(id.trim()));

      for (const docId of docIds) {
        if (!isNaN(docId)) {
          try {
            const docIdResult = await new Promise((resolve, reject) => {
              db.query(
                "CALL sp_create_doc_template_mapping(?,?,?,?)",
                [
                  userDetails.companyId,
                  body.template_name,
                  docId,
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
            results.push(docIdResult);
          } catch (error) {
            console.error("Error inserting doc_id:", error);
          }
        } else {
          console.error("Invalid doc_id:", docId);
        }
      }

      return results;
    } catch (err) {
      throw err;
    }
  },
  validateTemplateExistance: async (userDetails, body) => {
    try {
      var result = await callTemplateExistanceCheckProcedure(userDetails, body);

      return result;
    } catch (err) {
      throw err;
    }
  },
  EditTemplateNew: async (userDetails, body) => {
    try {
      var result = await callTemplateUpdateProcedure(userDetails, body);

      return result;
    } catch (err) {
      throw err;
    }
  },

  UpdateTemplateAttchementsDocs: async (userDetails, body, files, imageUrl) => {
    try {
      let results = [];

      try {
        const attachmentPaths = await new Promise((resolve, reject) => {
          db.query(
            "call sp_get_template_attachments_path(?,?,?)",
            [userDetails.companyId, body.template_id,body.existingAttched_name],
            (err, results) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                resolve(results[0].map((result) => result.attachment_path));
              }
            }
          );
        });
        // console.log(attachmentPaths);
        // Delete attachments from local filesystem
        attachmentPaths.forEach((path) => {
          try {
            fs.unlinkSync(path); // Synchronously delete the file
            // console.log(`Deleted attachment at path: ${path}`);
          } catch (error) {
            console.error(`Error deleting attachment at path ${path}:`, error);
          }
        });

        const deletionResult = await new Promise((resolve, reject) => {
          db.query(
            "CALL sp_delete_existing_doc_attached(?,?,?)",
            [userDetails.companyId, body.template_id,body.existingAttched_name],
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
        results.push(deletionResult);
      } catch (error) {
        console.error("Error deleting records:", error);
      }


      // Insert rows for each file
      for (const file of files) {
        try {
          let filepath = `${file.path}`;
          // console.log("uploading", filepath);

          const fileResult = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_update_attachment_template_mapping_new(?,?,?,?,?,?)",
              [
                userDetails.companyId,
                body.template_id,
                file.originalname,
                file.mimetype,
                filepath,
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
          results.push(fileResult);
        } catch (error) {
          console.error("Error inserting file:", error);
        }
      }

      const docIds = body.doc_id.split(",").map((id) => parseInt(id.trim()));

      for (const docId of docIds) {
        if (!isNaN(docId)) {
          try {
            const docIdResult = await new Promise((resolve, reject) => {
              db.query(
                "CALL sp_update_doc_template_mapping_new(?,?,?,?)",
                [
                  userDetails.companyId,
                  body.template_id,
                  docId,
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
            results.push(docIdResult);
          } catch (error) {
            console.error("Error inserting doc_id:", error);
          }
        } else {
          console.error("Invalid doc_id:", docId);
        }
      }

      return results;
    } catch (err) {
      throw err;
    }
  },
  getAllTemplate: async (userDetails) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_template(?)",
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
  getAllDocType: async () => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_get_all_docTypes()", (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  editTemplateAttachmentMapping: async (userDetails, body, files) => {
    try {
      let results = [];

      // console.log("files array");
      // console.log(files.length)

      // Insert rows for each file
      // for (const file of files) {
      //   try {
      //     let filepath = `${file.path}`;
      //     console.log("uploading", filepath);

      //     const fileResult = await new Promise((resolve, reject) => {
      //       db.query(
      //         "CALL sp_create_attachment_template_mapping(?,?,?,?,?,?)",
      //         [
      //           userDetails.companyId,
      //           body.template_name,
      //           file.originalname,
      //           file.mimetype,
      //           filepath,
      //           userDetails.user_id,
      //         ],
      //         (err, result) => {
      //           if (err) {
      //             console.error(err);
      //             reject(err);
      //           } else {
      //             resolve(result);
      //           }
      //         }
      //       );
      //     });
      //     results.push(fileResult);
      //   } catch (error) {
      //     console.error("Error inserting file:", error);
      //   }
      // }

      const docIds = body.doc_id.split(",").map((id) => parseInt(id.trim()));

      try {
        const docIdResult = await new Promise((resolve, reject) => {
          db.query(
            "CALL sp_Update_doc_template_mapping(?,?,?,?)",
            [
              userDetails.companyId,
              body.template_name,
              JSON.stringify(docIds),
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
        results.push(docIdResult);
      } catch (error) {
        console.error("Error inserting doc_id:", error);
      }

      return results;
    } catch (err) {
      throw err;
    }
  },
  editTemplate: async (userDetails, body) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_Update_template( ?, ?,?,?, ?)",
          [
            body.templateId,
            userDetails.companyId,
            body.template_name,
            body.description,
            userDetails.user_id,
          ],
          (err, result) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              // console.log(result);
              resolve(result);
            }
          }
        );
      });
      return result; // Return the result here
    } catch (err) {
      throw err;
    }
  },
  getTemplateById: async (userDetails, template_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log([userDetails.companyId, template_id]);
        db.query(
          "CALL sp_get_TemplateByTempId(?,?)",
          [userDetails.companyId, template_id],
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
  getFreeTepmlateModel: async (req,res)=>{
    try
    {
  const result = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_get_free_template_details_category(?)",
          [req.body.category_id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
      return result[0];
    }
    catch(err)
    {
      throw err;
    }
  }
};
async function callTemplateExistanceCheckProcedure(userDetails, body) {
  try {
    // console.log(userDetails);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_createTemplate( ?, ?,?,?,?,?)",
        [
          userDetails.companyId,
          body.template_name,
          body.description,
          userDetails.user_id,
          body.add_unsubscribe,
          body.list_id || null
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
    return result; // Return the result here
  } catch (err) {
    throw err;
  }
}

async function callTemplateUpdateProcedure(userDetails, body) {
  try {
    console.log(userDetails);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_updateTemplate( ?, ?,?,?,?,?,?)",
        [
          userDetails.companyId,
          body.template_id,
          body.template_name,
          body.description,
          userDetails.user_id,
          body.add_unsubscribe,
          body.list_id || null
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            // console.log(result);
            resolve(result);
          }
        }
      );
    });
    return result; // Return the result here
  } catch (err) {
    throw err;
  }
}

module.exports = templatetModel;
