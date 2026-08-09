const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
// CREATE USER
const registerUser = async (req, res) => {
    try {
        let { name, email, password, city } = req.body;
        // Enforce lowercase email for consistency
        if (email) email = email.toLowerCase();
        // 1. Check existing user FIRST to avoid unnecessary Cloudinary upload
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        // 2. Handle Cloudinary Upload
        let profilePhoto = "";
        let profilePhotoId = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                req.file.path,
                { folder: "mern-users" }
            );
            profilePhoto = result.secure_url;
            profilePhotoId = result.public_id;
            fs.unlinkSync(req.file.path);
        }
        // 3. Hash password and save
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profilePhoto,
            profilePhotoId,
            city,
        });
        // Remove password from response
        const safeUser = await User.findById(user._id).select("-password");
        res.status(201).json({
            success: true,
            user: safeUser,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// LOGIN USER
const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        // Enforce lowercase email
        if (email) email = email.toLowerCase();
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Get user details without the password
        const safeUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// GET LOGGED IN USER PROFILE
const getMyProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// GET ALL USERS (Paginated, Filtered, Sorted)
const getUsers = async (req, res) => {
    try {
        // Pagination
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 5);
        const skip = (page - 1) * limit;

        // Dynamic Filters
        const filter = {};

        // Search by name OR email (with escaped regex)
        if (req.query.search) {
            const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedSearch, "i");
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        if (req.query.city) filter.city = req.query.city;
        if (req.query.role) filter.role = req.query.role;

        // Sorting (Clean object lookup)
        const sort = {
            new: { createdAt: -1 },
            old: { createdAt: 1 },
            name: { name: 1 },
            "-name": { name: -1 }
        }[req.query.sort] || { createdAt: -1 };

        const totalUsers = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE USER
const deleteUser = async (req, res) => {
    try {
        // First, find the user to get the Cloudinary ID
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete profile photo from Cloudinary to prevent orphaned images
        if (userToDelete.profilePhotoId) {
            await cloudinary.uploader.destroy(userToDelete.profilePhotoId);
        }

        // Delete user from Database
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
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

// UPDATE USER
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        let { name, email } = req.body;

        if (email) {
            email = email.toLowerCase();

            // Check if the new email belongs to someone else
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use by another account",
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMyProfile,
    getUsers,
    deleteUser,
    updateUser,
};