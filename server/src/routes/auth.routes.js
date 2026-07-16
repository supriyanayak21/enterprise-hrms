const express = require("express");
const protect = require("../middleware/auth.middleware");

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/auth.controller");

const router = express.Router();

// Register
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

module.exports = router;