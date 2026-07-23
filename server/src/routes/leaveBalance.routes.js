const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

const { createLeaveBalance} = require("../controllers/leaveBalance.controller");



router.post(
    "/",
    protect,
    authorizeRoles("Admin", "HR"),
    createLeaveBalance
);




module.exports = router;