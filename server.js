const express = require("express");
const app = express();
const userRoutes = require("./src/routes/userRoutes");
app.use(express.json());
app.use("/users", userRoutes)
app.listen(5000, () => {
    console.log("server running on port 5000");
})
