const express = require("express");

const router = express.Router();

const { applyLeave } = require("../controllers/leave.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/apply",
  protect,
  authorizeRoles("Employee", "HR", "Admin"),
  applyLeave
);

module.exports = router;