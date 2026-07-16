const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/auth.controller");

const router = express.Router();


router.get(
  "/admin",
  protect,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/hr-dashboard",
  protect,
  authorizeRoles("Admin", "HR"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome HR Dashboard",
    });
  }
);
// Register
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

module.exports = router;