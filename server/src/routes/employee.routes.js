const express = require("express");

const { createEmployee,
        getAllEmployees,
 } = require("../controllers/employee.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

// Create Employee
router.post(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  createEmployee
);
//get all employees
router.get(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  getAllEmployees
);

module.exports = router;