const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { createLeaveBalance,
    getAllLeaveBalances,
    getLeaveBalanceById
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
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getLeaveBalanceById
);


module.exports = router;