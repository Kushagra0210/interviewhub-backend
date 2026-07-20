
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
// Load environment variables from .env
dotenv.config();
require("dotenv").config();
require("./config/cloudinary")
// Connect MongoDB database
connectDB();
// Create express app
const app = express();
// Middleware to read JSON from request body
app.use(express.json());
// Import routes
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./src/routes/userRoutes");
// Register routes
app.use("/analytics", analyticsRoutes);
const analyticsRoutes = require("./src/routes/analyticsRoutes")
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);
// Start server 
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
}); 7