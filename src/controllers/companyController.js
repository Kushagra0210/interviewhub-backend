const Company = require("../models/Company");
// create company
const createCompany = async (req, res) => {
    try {
        const company = await Company.create(req.body);
        res.status(201).json({
            success: true,
            company
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
//get all companies
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({
            success: true,
            companies
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// get single company
const getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }
        res.status(200).json({
            success: true,
            company
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }
        res.status(200).json({
            success: true,
            company
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        }
        );
    }
};
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company deleted successfully"
            });
        }
        await company.deleteOne();
        req.status(200).json({
            success: true,
            message: "Company Deleted Successfully"
        });
    }
    catch (error) {
        req.status(200).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany
}