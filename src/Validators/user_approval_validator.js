const { body, validationResult } = require("express-validator");

const userApprovalValidator = [
  body("id")
    .isInt({ min: 0 })
    .withMessage("id must be a positive integer"),

  body("user_id")
    .isInt({ min: 1 })
    .withMessage("user_id must be a positive integer"),

  body("company_id")
    .isInt({ min: 1 })
    .withMessage("company_id must be a positive integer"),

  body("level_approval")
    .isInt({ min: 1 })
    .withMessage("level_approval must be a positive integer"),

  body("module_json")
    .isArray({ min: 1 })
    .withMessage("module_json must be a non-empty array"),

  body("module_json.*.module_id")
    .isInt({ min: 1 })
    .withMessage("module_id must be a positive integer"),

  body("module_json.*.module_name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("module_name is required"),

  body("approver_json")
    .isArray({ min: 1 })
    .withMessage("approver_json must be a non-empty array"),

  body("approver_json.*.level_id")
    .isInt({ min: 1 })
    .withMessage("level_id must be a positive integer"),

  body("approver_json.*.level_tag")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("level_tag is required"),

  body("approver_json.*.approver_user_id")
    .isInt({ min: 1 })
    .withMessage("approver_user_id must be a positive integer"),

  body("approver_json.*.approver_user_email")
    .isEmail()
    .withMessage("approver_user_email must be a valid email"),

  body("created_by")
    .isInt({ min: 1 })
    .withMessage("created_by must be a positive integer")
];

// Middleware to handle validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  userApprovalValidator,
  validateRequest
};
