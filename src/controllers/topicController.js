const Topic = require("../models/Topics");
// create topic 
exports.createTopic = async (req, res) => {
    try {
        const topic = await Topic.create(req.body);
        res.status(201).json({
            success: true,
            message: "Topic created successfully",
            topic
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// get all topic
exports.getTopics = async (req, res) => {
    try {
        const topic = await Topic.find().sort({ name: 1 });
        res.status(201).json({
            success: true,
            topic
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// get sinfle topic 
exports.getTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }
        res.status(200).json({
            success: true,
            topic
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// update topic
exports.updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findByIdAndUpdate(req.params.id,
            req.body, {
            new: true,
            runValidators: true
        }
        );
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Topic updated successfully",
            topic
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// delete topic
exports.deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }
        await topic.deleteOne();
        res.status(200).json({
            success: true,
            message: "Topic deleted successfully"

        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};