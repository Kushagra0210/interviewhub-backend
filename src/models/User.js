// Import mongoose
const mongoose = require("mongoose");
// Create schema
const userSchema = new mongoose.Schema(
    {
        // User name field
        name: {
            type: String,
            required: true,
        },
        // User email field
        email: {
            type: String,
            required: true,
            unique: true,
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