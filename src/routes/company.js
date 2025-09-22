const express = require('express');
const router = express.Router();
const company = require('../Controller/company');
// const auth = require("../middleware/auth");

// Retrieve all companies
router.get('/company/getAll',company.findAll);

// Create a new company
router.post('/create', company.create);

// Retrieve a single company detail with id
router.get('/company/:companyId', company.findById);


router.get('/companyby/:userId', company.findByUserID);

router.get('/companyDetails/employees', company.getNumEmployees);

// Update a company with id
router.post('/company', company.update);

// Delete a employee with id
// router.delete('/:id', Jobs.delete);

module.exports = router