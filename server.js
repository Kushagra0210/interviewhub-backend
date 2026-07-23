const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
require("./src/config/cloudinary");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
const companyRoutes = require("./src/routes/companyRoutes");
const userRoutes = require("./src/routes/userRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
const questionRoutes = require("./src/routes/questionRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});