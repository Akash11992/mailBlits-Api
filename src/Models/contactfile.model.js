const { log } = require("handlebars/runtime");
const db = require("../../config/db.config");

const contactModel = {
  addBulkdetails: async (
    newData,
    contactData,
    email,
    keys,
    values,
    userDetails,
    filteredContact,
    contact_file_id
  ) => {
    try {
      // console.log("keys",contactData);
      // for (let i = 0; i < keys.length; i++) {
      // Call the stored procedure for each key-value pair
      var result = await callInsertBulkProcedure(
        newData,
        contactData,
        email,
        keys,
        values,
        userDetails,
        filteredContact,
        contact_file_id
      );
      // console.log("model", result);
      // }
      return result; // Return the array of results
    } catch (err) {
      throw err;
    }
  },
  getAllContacts: async (userDetails, list_id, segment_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        // console.log("cid...",userDetails.companyId);
        if (segment_id === null) {
          console.log(`SEGMENT ID IS NULL`, segment_id);
          db.query(
            "CALL sp_getAllContactDetailsByCid(?,?,?)",
            [userDetails.companyId, list_id, segment_id],
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
        } else {
          console.log(`SEGMENT ID IS NOT NULL`, segment_id);

          db.query(
            "CALL sp_segmentWiseContactDetailsGetByCid(?,?)",
            [userDetails.companyId, segment_id],
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
        }
      });

      return result;
    } catch (err) {
      throw err;
    }
  },
  validateConatctInListExistance: async (newData, userDetails, email) => {
    try {
      // console.log("keys",contactData);
      var result = await callContactExistanceInListCheckProcedure(
        newData,
        userDetails,
        email
      );

      return result; // Return the array of results
    } catch (err) {
      throw err;
    }
  },
  check_list: async (userDetails, body) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_IsListExist(?,?)",
          [userDetails.companyId, body.list_name],
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
  getAllList: async (userDetails, body) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        console.log("cid...", userDetails.companyId);
        db.query(
          "CALL sp_getall_list(?)",
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
  updateBulkdetails: async (
    newData,
    contactData,
    email,
    keys,
    values,
    userDetails,
    filteredContact,
    contact_file_id
  ) => {
    try {
      // console.log("keys",contactData);
      // for (let i = 0; i < keys.length; i++) {
      // Call the stored procedure for each key-value pair
      var result = await callUpdateBulkProcedure(
        newData,
        contactData,
        email,
        keys,
        values,
        userDetails,
        filteredContact,
        contact_file_id
      );
      // console.log("model", result);
      // }
      return result; // Return the array of results
    } catch (err) {
      throw err;
    }
  },
  deleteContact: async (contact_id) => {
    // console.log(company_id);
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_delete_contact(?)",
          [contact_id],
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
  saveSelectedContactToList: async (
    contactIdList,
    listId,
    userDetails
  ) => {
    try {
     
      var result = await callSaveContactToListProcedure(
        contactIdList,
        listId,
        userDetails,
      );
     
      return result; 
    } catch (err) {
      throw err;
    }
  },

  saveContactReview: async (
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_ignore_count,
        p_new_contact,
        p_created_by
  ) => {
    try {
     
      var result = await callSaveContactReviewProcedure(
        p_file_name,
        p_file_path,
        p_file_type,
        p_company_id,
        p_total_contact,
        p_duplicate_contact,
        p_re_added_contact,
        p_ignore_count,
        p_new_contact,
        p_created_by
      );
     
      return result; 
    } catch (err) {
      throw err;
    }
  },

  saveSelectedContactToNewList: async (
    contactIdList,
    listName,
    userDetails,
    res
  ) => {
    try {
     console.log("listName",listName)
      var result = await callSaveContactToNewListProcedure(
        contactIdList,
        listName,
        userDetails,
        res
      );
     
      return result; 
    } catch (err) {
      throw err;
    }
  },
  update_ReplaceBulkdetails: async (
    newData,
    contactId,
    email,
    userDetails,
    filteredContact
  ) => {
    try {
      // console.log("keys",contactData);
      // for (let i = 0; i < keys.length; i++) {
      // Call the stored procedure for each key-value pair
      var result = await callUpdate_ReplaceBulkProcedure(
        newData,
        contactId,
        email,
        userDetails,
        filteredContact
      );
      // console.log("model", result);
      // }
      return result; // Return the array of results
    } catch (err) {
      throw err;
    }
  },

  cleanListCountDetailsTmpData: async (list_name, user_id) => {
    try {
      const result = await new Promise((resolve, reject) => {
          db.query("CALL sp_cleanup_list_count_details_tmp(?, ?)", [list_name, user_id], (err, result) => {
          if (err) {
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

  saveCountInTmpTable: async (raw_data, list_name, user_id) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_save_count_in_tmp_table(?, ?, ?)", [JSON.stringify(raw_data), list_name, user_id], (err, result) => {
          if (err) {
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

  getCountPaginationDetails: async (list_name, type, page_number, page_size, user_id) => {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query("CALL sp_get_paginated_tmp_data(?, ?, ?, ?, ?)", [list_name, type, page_number, page_size, user_id], (err, result) => {
          if (err) {
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
  }
};
async function callInsertBulkProcedure(
  newData,
  contactData,
  email,
  key,
  value,
  userDetails,
  filteredContact,
  contact_file_id
) {
  try {
    // console.log("12",filteredContact);
    const result = await new Promise((resolve, reject) => {
      // db.query(
      //   "CALL sp_insert_contact_details( ?, ?, ?, ?,?,?)",
      //   [userDetails.companyId, key, value, userDetails.user_id, email,JSON.stringify(filteredContact)],
      //   (err, result) => {
      //     if (err) {
      //       console.error(err);
      //       reject(err);
      //     } else {
      //       // console.log(result);
      //       resolve(result);
      //     }
      //   }
      // );

      db.query(
        "CALL sp_create_contact_details_list( ?,?, ?, ?, ?,?,?,?)",
        [
          userDetails.companyId,
          newData.source_id,
          newData.list_name,
          email,
          "",
          JSON.stringify(filteredContact),
          userDetails.user_id,
          contact_file_id
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

async function callContactExistanceInListCheckProcedure(
  newData,
  userDetails,
  email
) {
  try {
    // console.log([newData.list_id, userDetails.companyId, email]);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_validateContactPresent_inList(?, ?,?)",
        [newData.list_id, userDetails.companyId, email],
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

async function callUpdateBulkProcedure(
  newData,
  contactData,
  email,
  key,
  value,
  userDetails,
  filteredContact,
  contact_file_id
) {
  try {
    // console.log("12",filteredContact);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_update_contact_details_list( ?, ?, ?, ?,?,?,?,?)",
        [
          userDetails.companyId,
          newData.list_name,
          newData.list_id,
          email,
          "",
          JSON.stringify(filteredContact),
          userDetails.user_id,
          contact_file_id
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



async function callSaveContactToListProcedure(
  contactIdList,
  listId,
  userDetails
) {
  try {
    // console.log("12",filteredContact);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_UpdateOrInsertContactListMapping(?, ?, ?, ?,?)",
        [
          listId,
          JSON.stringify(contactIdList),
          userDetails.companyId,
          userDetails.user_id,
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
}

async function callSaveContactReviewProcedure(
  
  p_file_name,
  p_file_path,
  p_file_type,
  p_company_id,
  p_total_contact,
  p_duplicate_contact,
  p_re_added_contact,
  p_ignore_count,
  p_new_contact,
  p_created_by
) {
try {

const result = await new Promise((resolve, reject) => {
db.query(
  "call sp_insert_contact_review(?,?,?,?,?,?,?,?,?,?)",
  [
  p_file_name,
  p_file_path,
  p_file_type,
  p_company_id,
  p_total_contact,
  p_duplicate_contact,
  p_re_added_contact,
  p_ignore_count,
  p_new_contact,
  p_created_by
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
return result;
} catch (err) {
throw err;
}
}

async function callUpdate_ReplaceBulkProcedure(
  newData,
  contactId,
  email,
  userDetails,
  filteredContact
) {
  try {
    // console.log("12",filteredContact);
    const result = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_update_contactdetailOflist( ?, ?, ?, ?,?,?)",
        [
          userDetails.companyId,
          newData.list_id,
          contactId,
          email,
          JSON.stringify(filteredContact),
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
}



async function callSaveContactToNewListProcedure(
  contactIdList,
  listName,
  userDetails,
  res
) {
  try {

    const listId = await new Promise((resolve, reject) => {
      db.query(
        "CALL sp_InsertList(?, ?, ?, ?)",
        [
          listName,
          userDetails.companyId,
          1,   // userDetails.source_id,
          userDetails.user_id,
        ],
        (err, result) => {
          console.log("res",result);
          
          if (err) {
            console.error(err);

            res.status(400).json({
              success: true,
              error: false,
              message: "Server Error!",
            });

            reject(err);
          } else {
            if(result[0][0].response==="fail"){
              res.status(400).json({
                success: true,
                error: false,
                message: "list already exist!",
              });
            }else{
              const newListId = result[0][0].list_id;

              resolve(result[0][0].list_id);
            }
            
            // db.query("SELECT @newListId AS newListId", (err, resultListId) => {
            //   if (err) {
            //     console.error(err);
            //     reject(err);
            //   } else {
            //     const newListId = resultListId[0].newListId;
            //     resolve(newListId);
            //   }
            // });
          }
        }
      );
    });

      console.log("ab",listId)


      const finalResult =  await new Promise((resolve, reject) => {
        db.query(
          "CALL sp_InsertContactListMapping(?, ?, ?, ?, ?)",
          [
            listId,
            userDetails.companyId,
            JSON.stringify(contactIdList),
            userDetails.user_id,
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


      console.log("finalResult",finalResult)

    return finalResult; // Return the result here
  } catch (err) {
    throw err;
  }

  
}

module.exports = contactModel;  
