// Import express
const express = require("express");
// Create router
const router = express.Router();
// Import controllers
// import middleware
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const validateRegister = require("../middleware/validateMiddleware");
const {
    registerUser,
    loginUser,
    getMyProfile,
    getUsers,
    deleteUser,
    updateUser,
} = require("../controllers/userController");
// CREATE USER API
router.post("/register", upload.single("profilePhoto"), validateRegister, registerUser);
// create user login api
router.post("/login", loginUser);
// GET CURRENT USER PROFILE
router.get("/profile", protect, getMyProfile);
// GET USERS API
router.get("/", protect, admin, getUsers);
// UPDATE
router.put("/:id", protect, admin, updateUser);
// DELETE USER API
router.delete("/:id", protect, admin, deleteUser);
// Export router
module.exports = router;