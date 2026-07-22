const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");
const LeaveType = require("../models/leaveType.model");
const Counter = require("../models/counter.model");
const mongoose = require("mongoose");

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


// ===========================================
// Get All Leave Requests
// ===========================================
const getAllLeaves = async (req, res, next) => {
  try {
    // Search & Pagination
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = req.query.sort || "-createdAt";

    // Filters
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.leaveType) {
      filter.leaveType = req.query.leaveType;
    }

    if (req.query.employee) {
      filter.employee = req.query.employee;
    }

    // Search Employees
    if (search) {
      const employees = await Employee.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const employeeIds = employees.map((emp) => emp._id);

      filter.$or = [
        { leaveId: { $regex: search, $options: "i" } },
        { employee: { $in: employeeIds } },
      ];
    }

    // Fetch Leave Requests
    const leaves = await Leave.find(filter)
      .populate({
        path: "employee",
        select: "employeeId firstName lastName department designation",
        populate: {
          path: "department",
          select: "departmentCode departmentName",
        },
      })
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName isPaid",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalLeaves = await Leave.countDocuments(filter);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalLeaves / limit),
      totalLeaves,
      leaves,
    });

  } catch (error) {
    next(error);
  }
};

// ===========================================
// Get Leave By ID
// ===========================================
const getLeaveById = async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave ID.",
      });
    }

    const leave = await Leave.findById(req.params.id)
      .populate({
        path: "employee",
        select: "employeeId firstName lastName designation department",
        populate: {
          path: "department",
          select: "departmentCode departmentName",
        },
      })
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName maxDaysPerYear isPaid",
      })
      .populate({
        path: "approvedBy",
        select: "fullName email role",
      });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    res.status(200).json({
      success: true,
      leave,
    });

  } catch (error) {
    next(error);
  }
};



// ===========================================
// Update Leave
// ===========================================
const updateLeave = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave ID.",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    // Only Pending leave can be updated
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be updated.",
      });
    }

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

    // Employee validation
    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Leave type validation
    const leaveTypeExists = await LeaveType.findById(leaveType);

    if (!leaveTypeExists) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    if (leaveTypeExists.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Selected leave type is inactive.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date.",
      });
    }

    // Calculate total days
    const totalDays =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Overlapping validation (ignore current leave)
    const overlappingLeave = await Leave.findOne({
      _id: { $ne: req.params.id },
      employee,
      status: { $ne: "Rejected" },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: "Employee already has another leave during this period.",
      });
    }

    // Update fields
    leave.employee = employee;
    leave.leaveType = leaveType;
    leave.startDate = start;
    leave.endDate = end;
    leave.totalDays = totalDays;
    leave.reason = reason;

    await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave updated successfully.",
      leave,
    });

  } catch (error) {
    next(error);
  }
};


const approveLeave = async (req, res, next) => {
  try {

    // ==========================================
    // 1. Validate Leave Request ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave Request ID.",
      });
    }

    // ==========================================
    // 2. Find Leave Request
    // ==========================================

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    // ==========================================
    // 3. Validate Leave Status
    // ==========================================

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leave.status.toLowerCase()}.`,
      });
    }

    // ==========================================
    // 4. Validate Employee
    // ==========================================

    const employee = await Employee.findById(leave.employee)
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve leave for an inactive employee.",
      });
    }

    // ==========================================
    // 5. Validate Leave Type
    // ==========================================

    const leaveType = await LeaveType.findById(leave.leaveType);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    if (leaveType.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve an inactive leave type.",
      });
    }

    // ==========================================
    // 6. Approve Leave
    // ==========================================

    leave.status = "Approved";
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();
    leave.remarks = req.body.remarks || "";

    await leave.save();

    // ==========================================
    // 7. Return Response
    // ==========================================

    const approvedLeave = await Leave.findById(leave._id)
      .populate({
        path: "employee",
        select: "employeeId firstName lastName designation department",
        populate: {
          path: "department",
          select: "departmentCode departmentName",
        },
      })
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName",
      })
      .populate({
        path: "approvedBy",
        select: "fullName email role",
      });

    res.status(200).json({
      success: true,
      message: "Leave approved successfully.",
      leave: approvedLeave,
    });

  } catch (error) {
    next(error);
  }
};


// ==========================================
// Reject Leave
// ==========================================
const rejectLeave = async (req, res, next) => {
  try {

    // ==========================================
    // Validate Leave Request ID
    // ==========================================
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave Request ID.",
      });
    }

    // ==========================================
    // Find Leave Request
    // ==========================================
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    // ==========================================
    // Validate Leave Status
    // ==========================================
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leave.status.toLowerCase()}.`,
      });
    }

    // ==========================================
    // Validate Employee
    // ==========================================
    const employee = await Employee.findById(leave.employee)
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Employee is inactive.",
      });
    }

    // ==========================================
    // Validate Leave Type
    // ==========================================
    const leaveType = await LeaveType.findById(leave.leaveType);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    if (leaveType.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Leave type is inactive.",
      });
    }

    // ==========================================
    // Remarks Required
    // ==========================================
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required.",
      });
    }

    // ==========================================
    // Reject Leave
    // ==========================================
    leave.status = "Rejected";
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();
    leave.remarks = remarks.trim();

    await leave.save();

    // ==========================================
    // Populate Response
    // ==========================================
    const rejectedLeave = await Leave.findById(leave._id)
      .populate({
        path: "employee",
        select: "employeeId firstName lastName designation department",
        populate: {
          path: "department",
          select: "departmentCode departmentName",
        },
      })
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName",
      })
      .populate({
        path: "approvedBy",
        select: "fullName email role",
      });

    res.status(200).json({
      success: true,
      message: "Leave rejected successfully.",
      leave: rejectedLeave,
    });

  } catch (error) {
    next(error);
  }
};


const getMyLeaveHistory = async (req, res, next) => {
  try {
    // Find employee linked to logged-in user
    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    // Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sort = req.query.sort || "-createdAt";
    const search = req.query.search || "";
    const status = req.query.status;

    // Build Filter
    const filter = {
      employee: employee._id,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      const leaveTypes = await LeaveType.find({
        leaveName: { $regex: search, $options: "i" },
      }).select("_id");

      filter.leaveType = {
        $in: leaveTypes.map((item) => item._id),
      };
    }

    const leaves = await Leave.find(filter)
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName isPaid",
      })
      .populate({
        path: "approvedBy",
        select: "fullName role",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Leave.countDocuments(filter);

    const approved = await Leave.countDocuments({
      employee: employee._id,
      status: "Approved",
    });

    const pending = await Leave.countDocuments({
      employee: employee._id,
      status: "Pending",
    });

    const rejected = await Leave.countDocuments({
      employee: employee._id,
      status: "Rejected",
    });

    res.status(200).json({
      success: true,

      summary: {
        total,
        approved,
        pending,
        rejected,
      },

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      totalRecords: total,

      leaveHistory: leaves,
    });

  } catch (error) {
    next(error);
  }
};


const getEmployeeLeaveHistory = async (req, res, next) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID.",
      });
    }

    const employee = await Employee.findById(req.params.employeeId)
      .populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const sort = req.query.sort || "-createdAt";

    const search = req.query.search || "";

    const status = req.query.status;

    const filter = {
      employee: employee._id,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      const leaveTypes = await LeaveType.find({
        leaveName: {
          $regex: search,
          $options: "i",
        },
      }).select("_id");

      filter.leaveType = {
        $in: leaveTypes.map((type) => type._id),
      };
    }

    const leaveHistory = await Leave.find(filter)
      .populate({
        path: "leaveType",
        select: "leaveCode leaveName isPaid",
      })
      .populate({
        path: "approvedBy",
        select: "fullName role",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Leave.countDocuments(filter);

    const approved = await Leave.countDocuments({
      employee: employee._id,
      status: "Approved",
    });

    const pending = await Leave.countDocuments({
      employee: employee._id,
      status: "Pending",
    });

    const rejected = await Leave.countDocuments({
      employee: employee._id,
      status: "Rejected",
    });

    res.status(200).json({
      success: true,

      employee: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        department: employee.department,
      },

      summary: {
        total,
        approved,
        pending,
        rejected,
      },

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      totalRecords: total,

      leaveHistory,
    });

  } catch (error) {
    next(error);
  }
};




module.exports = {
  applyLeave,
    getAllLeaves,
    getLeaveById,
    updateLeave,
    approveLeave,
    rejectLeave,
    getMyLeaveHistory,
    getEmployeeLeaveHistory
};