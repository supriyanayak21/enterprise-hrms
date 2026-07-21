const express = require("express");

const router = express.Router();

const { createLeaveType } = require("../controllers/leaveType.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  createLeaveType
);

module.exports = router;