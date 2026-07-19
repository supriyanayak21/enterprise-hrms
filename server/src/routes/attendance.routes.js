const express = require("express");

const {
  checkIn,
  checkOut,
  getAllAttendance,
  getAttendanceById,
} = require("../controllers/attendance.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/check-in",
  protect,
  authorizeRoles("Admin", "HR"),
  checkIn
);

router.put(
  "/check-out/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  checkOut
);

router.get(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  getAllAttendance
);

router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getAttendanceById
);

module.exports = router;