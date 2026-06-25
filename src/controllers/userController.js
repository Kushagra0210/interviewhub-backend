// Import User model
const User = require("../models/User");
// CREATE USER
const createUser = async (req, res) => {
    try {
        // Extract data from request body
        const { name, email } = req.body;

        // Create new user in MongoDB
        const user = await User.create({
            name,
            email,
        });
        // Send success response
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// GET USERS
const getUsers = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find();
        // Send response
        res.json({
            success: true,
            users,
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// DELETE USER
const deleteUser = async (req, res) => {
    try {
        // Delete user by id
        await User.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "User deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Export controllers
module.exports = {
    createUser,
    getUsers,
    deleteUser,
};