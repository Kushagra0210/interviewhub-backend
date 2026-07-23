const express = require("express");
const router = express.Router();
const {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestionById,
    deleteQuestionById
} = require("../controllers/questionController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
router.post("/", protect, admin, createQuestion);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.put("/:id", protect, admin, updateQuestionById);
router.delete("/:id", protect, admin, deleteQuestionById);
module.exports = router;