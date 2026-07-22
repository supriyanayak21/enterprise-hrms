const express = require("express");

const router = express.Router();

const { applyLeave,
    getAllLeaves,
    getLeaveById,
    updateLeave,
    approveLeave,
    rejectLeave,
    getMyLeaveHistory,
    getEmployeeLeaveHistory
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


router.put(
  "/:id",
  protect,
  authorizeRoles("Employee", "HR", "Admin"),
  updateLeave
);

router.put(
    "/:id/approve",
    protect,
    authorizeRoles("Admin","HR"),
    approveLeave
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("Admin", "HR"),
  rejectLeave
);

router.get(
  "/my-leaves",
  protect,
  authorizeRoles("Employee"),
  getMyLeaveHistory
);

router.get(
  "/employee/:employeeId",
  protect,
  authorizeRoles("Admin", "HR"),
  getEmployeeLeaveHistory
);



module.exports = router;