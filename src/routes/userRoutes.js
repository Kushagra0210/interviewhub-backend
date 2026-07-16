// Import express
const express = require("express");
// Create router
const router = express.Router();
// Import controllers
// import middleware
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/validateMiddleware");
const validateRegister = require("../middleware/validateMiddleware");
const {
    loginUser,
    getMyProfile,
    getUsers,
    deleteUser,
    updateUser,
    registerUser,
} = require("../controllers/userController");
// CREATE USER API
router.post("/register", upload.single("profilePhoto"), validateRegister, registerUser);
// create user login api
router.post("/login", loginUser);
// GET CURRENT USER PROFILE
router.get("/profile", protect, getMyProfile);
// GET USERS API
router.get("/", protect, getUsers);
// DELETE USER API
router.delete("/:id", protect, deleteUser);
// UPDATE
router.put("/:id", protect, updateUser);
// Export router
module.exports = router;