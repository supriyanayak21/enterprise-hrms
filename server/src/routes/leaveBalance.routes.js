const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { createLeaveBalance,
    getAllLeaveBalances,
    getLeaveBalanceById,
    getEmployeeLeaveBalances,
    getMyLeaveBalance,
    updateLeaveBalance,
    deleteLeaveBalance
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

router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  updateLeaveBalance
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  deleteLeaveBalance
);



module.exports = router;