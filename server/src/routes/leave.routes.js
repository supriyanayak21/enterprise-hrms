const express = require("express");

const router = express.Router();

const { applyLeave,
    getAllLeaves,
    getLeaveById
 } = require("../controllers/leave.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post(
  "/apply",
  protect,
  authorizeRoles("Employee", "HR", "Admin"),
  applyLeave
);

router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getLeaveById
);

router.get(
  "/",
  protect,
  authorizeRoles("HR", "Admin"),
  getAllLeaves
);

module.exports = router;