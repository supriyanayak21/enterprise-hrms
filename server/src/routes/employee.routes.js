const express = require("express");

const { createEmployee,
        getAllEmployees,
        getEmployeeById,
        updateEmployee,
        deleteEmployee,
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
// Get Employee By ID
router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getEmployeeById
);

// Update Employee
router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  updateEmployee
);

// Delete Employee
router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  deleteEmployee
);


module.exports = router;