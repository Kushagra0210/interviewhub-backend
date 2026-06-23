const express = require("express");
const router = express.Router();
const { getUsers, createUser, getsingleUser, getSingleUser, searchUsers } = require("../controllers/userController");
router.get("/", getUsers);
router.post("/", createUser);
router.get("/search/query", searchUsers);
router.get("/:id", getSingleUser);
module.exports = router;