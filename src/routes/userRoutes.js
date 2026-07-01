// Import express
const express = require("express");
// Create router
const router = express.Router();
// Import controllers
const {
    createUser,
    getUsers,
    deleteUser,
    updateUser,
} = require("../controllers/userController");
// CREATE USER API
router.post("/", createUser);
// GET USERS API
router.get("/", getUsers);
// DELETE USER API
router.delete("/:id", deleteUser);
// UPDATE
router.put("/:id", updateUser);
// Export router
module.exports = router;