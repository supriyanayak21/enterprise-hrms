const express = require("express");

const {
  createDepartment,
  getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
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

router.get(
  "/",
  protect,
  authorizeRoles("Admin", "HR"),
  getAllDepartments
);

router.get(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  getDepartmentById
);

router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  updateDepartment
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "HR"),
  deleteDepartment
);

module.exports = router;