// Import mongoose
const mongoose = require("mongoose");
// Create schema
const userSchema = new mongoose.Schema(
    {
        name: {        // User name field
            type: String,
            required: true,
            trim: true,
        },
        // User email field
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        profilePhoto: {
            type: String,
            default: "",
        },
        profilePhotoId: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    // Schema options
    {
        timestamps: true,
    }
);
// Create model
const User = mongoose.model("User", userSchema);
// Export model
module.exports = User;