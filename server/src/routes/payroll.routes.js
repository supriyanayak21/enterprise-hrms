const express = require("express");

const router = express.Router();

const {
  generatePayroll,
} = require("../controllers/payroll.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/generate",
  protect,
  authorizeRoles("Admin", "HR"),
  generatePayroll
);

module.exports = router;