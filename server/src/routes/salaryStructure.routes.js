const express = require("express");

const router = express.Router();

const {
  createSalaryStructure,
} = require("../controllers/salaryStructure.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

// ==========================================
// Salary Structure Routes
// ==========================================

// Create Salary Structure
router.post(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  createSalaryStructure
);

module.exports = router;