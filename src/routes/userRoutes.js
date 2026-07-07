// Import express
const express = require("express");
// Create router
const router = express.Router();
// Import controllers
// import middleware
const protect = require("../middleware/authMiddleware");
const validateRegister = require("../middleware/validateMiddleware");
const {
    createUser,
    loginUser,
    getMyProfile,
    getUsers,
    deleteUser,
    updateUser,
} = require("../controllers/userController");
// CREATE USER API
router.post("/", validateRegister, createUser);
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