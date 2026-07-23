const express = require("express");
const router = express.Router();
const {
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany
} = require("../controllers/companyController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
router.get("/", getCompanies);
router.get("/:id", getCompany);
router.post("/", protect, admin, createCompany);
router.put("/:id", protect, admin, updateCompany);
router.delete("/:id", protect, admin, deleteCompany);
module.exports = router;