const express = require("express");
const { usersByCity } = require("../controllers/analyticsController");
const router = express.Router();
// get / analytics/users by city 
router.get("/users-by-city", usersByCity);
module.exports = router;