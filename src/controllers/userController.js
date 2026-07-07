// Import User model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// CREATE USER
const createUser = async (req, res) => {
    try {
        // Extract data from request body
        const { name, email, password } = req.body;
        // Create new user in MongoDB
        // check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "user already exists"
            });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
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
// login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
            },
            "process.env.JWT_SECRET",
            {
                expiresIn: "7d",
            }
        );
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// get logged in user 
const getMyProfile = async (req, res) => {
    try {
        // req.user comes from middleware
        req.status(201).json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        req.status(500).json({
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
// UPDATE USER CONTROLLER
const updateUser = async (req, res) => {
    try {
        // Get ID from URL
        const userId = req.params.id;
        // Get updated data from request body
        const { name, email } = req.body;
        // Find user by ID and update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                email,
            },
            {
                new: true,
            }
        );
        // If user not found
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Success response
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            updatedUser,
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
    loginUser,
    getMyProfile,
    getUsers,
    deleteUser,
};