const express = require("express");

const router = express.Router();

const { createLeaveType,
        getAllLeaveTypes,
        getLeaveTypeById
 } = require("../controllers/leaveType.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  createLeaveType
);

router.get(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  getAllLeaveTypes
);

router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getLeaveTypeById
);

module.exports = router;