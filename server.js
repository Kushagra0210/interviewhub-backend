// Import express framework
const express = require("express");
// Import dotenv package
const dotenv = require("dotenv");
// Import database connection function
const connectDB = require("./src/config/db");
// Load environment variables from .env
dotenv.config();
// Connect MongoDB database
connectDB();
// Create express app
const app = express();
// Middleware to read JSON from request body
app.use(express.json());
// Import routes
const userRoutes = require("./src/routes/userRoutes");
// Register routes
app.use("/users", userRoutes);
// Start server 
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});