
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
// Load environment variables from .env
dotenv.config();
require("dotenv").config();
require("./src/config/cloudinary");
// Connect MongoDB database
connectDB();
// Create express app
const app = express();
// Middleware to read JSON from request body
app.use(express.json());
// Import routes
const companyRoutes = require(".src/routes/companyRoutes");
const userRoutes = require("./src/routes/userRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
// Register routes

const analyticsRoutes = require("./src/routes/analyticsRoutes");
app.use("/analytics", analyticsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/topics", topicRoutes);
// Start server 
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
}); 