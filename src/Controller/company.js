'use strict';

const company = require('../Models/company');
// const VerifyToken = require('../middleware/auth');



exports.findAll = function (req, res) {
   
        company.findAll(function (err, employee) {
            if (err)
                res.send(err);
            res.send(employee);
        });
   
   
};

exports.getNumEmployees = async function(req, res) {
    await company.getNumEmployees().then((r) => {
        if (!r) {
            res.status(200).send({success: true, error: false, message: 'No data found'})
        } else if (r && r.length > 0) {
            res.status(200).send({error: false, success: true, message: 'Data fetched successfully', data:r[0]})
        } else {
            res.status(200).send({error: true, success: false, message: 'Data could not be loaded'})
        }
    }).catch((err) => {
        console.error("Error while fetching company data: ", err);
        res.status(500).send({error: true, success: false, message: "Something went wrong while fetching Employee data"});
    });
}


exports.create = function (req, res) {
        const companyDetail = new company(req.body);
        //handles null error
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            res.status(400).send({ error: true, success: false, message: 'Please provide all required field' });
        } else {
            company.create(companyDetail, function (err, response) {
                if (err)
                    res.send(err);
                res.json({error: false, message: 'Added Succesfully'});
            }).then(r => {
                if (r && r.length > 0) {
                    res.status(200).send({error: false, success: true, message: "Successfully added company details"});
                }
            }).catch((e) => {
                console.error(e);
                    res.status(200).send({error: true, success: false, message: "Something went wrong while saving company details"})
            });
        }
};


exports.findById = async function (req, res) {
    await company.findById(req.params.userId).then((r) => {
        if (!r) {
            res.status(200).send({error: false, success: true, message: 'No associated company data found'})
        } else {
            res.status(200).send({error: false, success: true, message: 'No associated company data found', data: r[0]})
        }
    }).catch((err) => {
        console.error("Error while fetching company data: ", err);
        res.status(500).send({error: true, success: false, message: "Something went wrong while fetching company details"});
    });
};



exports.findByUserID = async function (req, res) {
    await company.findByUserID(req.params.userId).then((r) => {
        if (!r) {
            res.status(200).send({error: false, success: true, message: 'No associated company data found'})
        } else {
            res.status(200).send({error: false, success: true, message: 'Registered Company data found', data: r[0]})
        }
    }).catch((err) => {
        console.error("Error while fetching company data: ", err);
        res.status(500).send({error: true, success: false, message: "Something went wrong while fetching company details"})
    });
};




exports.update = function (req, res) {
        const new_employee = new company(req.body);
// console.log("mmm..........",req.body);
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            res.status(400).send({ error: true, message: 'Please provide all required field' });
        } else {
            company.update(req.body.company_Id, new_employee, function (err, response) {
                if (err)
                    res.send(err);
                    res.json({ error: false, message: response });
            });
        }
   
};



