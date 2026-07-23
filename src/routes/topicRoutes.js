const express = require("express");
const router = express.Router();
const {
    createTopic,
    getTopics,
    getTopic,
    updateTopic,
    deleteTopic
} = require("../controllers/topicController");
const admin = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");
router.post("/", protect, admin, createTopic);
router.get("/", getTopics);
router.get("/:id", getTopic);
router.put("/:id", protect, admin, updateTopic);
router.delete("/:id", protect, admin, deleteTopic);
module.exports = router;