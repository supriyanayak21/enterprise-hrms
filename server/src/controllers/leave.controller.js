const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");
const LeaveType = require("../models/leaveType.model");
const Counter = require("../models/counter.model");

// ==========================================
// Apply Leave
// ==========================================
const applyLeave = async (req, res, next) => {
  try {
    const {
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // Required fields
    if (
      !employee ||
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check Employee
    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Check Leave Type
    const leaveTypeExists = await LeaveType.findById(leaveType);

    if (!leaveTypeExists) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    // Leave Type must be active
    if (leaveTypeExists.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This leave type is inactive.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Date validation
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    // Calculate total leave days
    const totalDays =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping leave
    const overlappingLeave = await Leave.findOne({
      employee,
      status: { $ne: "Rejected" },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message:
          "Employee already has a leave request during this period.",
      });
    }

    // Generate Leave ID
    const counter = await Counter.findOneAndUpdate(
      { _id: "leaveId" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    const leaveId = `LEV${String(counter.sequenceValue).padStart(4, "0")}`;

    // Create Leave
    const leave = await Leave.create({
      leaveId,
      employee,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully.",
      leave,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
};