const Question = require("../models/Question");
// Create question
exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({
            success: true,
            message: "Question created successfully",
            question
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// get all qns 
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('companies', "name slug logo")
            .populate('topics', "name slug")
            .select("-__v")
            .lean();
        res.status(200).json({
            success: true,
            questions
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Get Question By Id
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate("companies", "name slug logo")
            .populate("topics", "name slug")
            .select("-__v")
            .lean();
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }
        res.status(200).json({
            success: true,
            question
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
    ;
}
exports.updateQuestionById = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteQuestionById = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
