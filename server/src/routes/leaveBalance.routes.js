const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { createLeaveBalance,
    getAllLeaveBalances,
    getLeaveBalanceById,
    getEmployeeLeaveBalances,
    getMyLeaveBalance
} = require("../controllers/leaveBalance.controller");



router.post(
    "/",
    protect,
    authorizeRoles("Admin", "HR"),
    createLeaveBalance
);

router.get(
    "/",
    protect,
    authorizeRoles("Admin", "HR"),
    getAllLeaveBalances
);

router.get(
  "/my-balance",
  protect,
  authorizeRoles("Employee"),
  getMyLeaveBalance
);

router.get(
  "/employee/:employeeId",
  protect,
  authorizeRoles("Admin", "HR"),
  getEmployeeLeaveBalances
);


router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getLeaveBalanceById
);





module.exports = router;