// Import mongoose
const mongoose = require("mongoose");
// Function to connect database
const connectDB = async () => {
    try {
        // Connect MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};
// Export function
module.exports = connectDB;