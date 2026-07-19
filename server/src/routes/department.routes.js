const express = require("express");

const {
  createDepartment,
} = require("../controllers/department.controller");

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  createDepartment
);

module.exports = router;