// Import mongoose
const mongoose = require("mongoose");
// Create schema
const userSchema = new mongoose.Schema(
    {
        name: {        // User name field
            type: String,
            required: true,
        },
        // User email field
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        profilePhoto: {
            type: String
        },
        profilePhotoId: {
            type: String
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        }
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