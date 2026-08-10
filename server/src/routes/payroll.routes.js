const express = require("express");

const router = express.Router();

const {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  getEmployeePayrollHistory,
  getMyPayslips,
  updatePayroll
} = require("../controllers/payroll.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/generate",
  protect,
  authorizeRoles("Admin", "HR"),
  generatePayroll
);

router.get(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  getAllPayrolls
);

router.get(
  "/employee/:employeeId",
  protect,
  authorizeRoles("Admin", "HR"),
  getEmployeePayrollHistory
);

router.get(
  "/my-payslips",
  protect,
  authorizeRoles("Employee"),
  getMyPayslips
);

router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  updatePayroll
);


router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getPayrollById
);



module.exports = router;