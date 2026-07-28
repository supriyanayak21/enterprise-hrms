const LeaveBalance = require("../models/leaveBalance.model");
const Employee = require("../models/employee.model");
const LeaveType = require("../models/leaveType.model");
const Leave = require("../models/leave.model");
const mongoose = require("mongoose");

const createLeaveBalance = async (data) => {

    const {
        employee,
        leaveType,
        allocatedLeave,
        year,
    } = data;

    // Validate Employee

    const employeeExists =
        await Employee.findById(employee);

    if (!employeeExists) {
        throw new Error("Employee not found.");
    }

    // Validate Leave Type

    const leaveTypeExists =
        await LeaveType.findById(leaveType);

    if (!leaveTypeExists) {
        throw new Error("Leave type not found.");
    }

    // Check Duplicate

    const existingBalance =
        await LeaveBalance.findOne({

            employee,

            leaveType,

            year,

        });

    if (existingBalance) {
        throw new Error(
            "Leave balance already exists for this employee."
        );
    }

    // Calculate Remaining Leave

    const remainingLeave = allocatedLeave;

    // Create Balance

    const leaveBalance =
        await LeaveBalance.create({

            employee,

            leaveType,

            year,

            allocatedLeave,

            usedLeave: 0,

            remainingLeave,

        });

    return leaveBalance;
};

const getAllLeaveBalances = async (query) => {

  const {
    page = 1,
    limit = 10,
    search = "",
    year,
    leaveType,
    department,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  const currentPage = Number(page);
  const pageSize = Number(limit);

  // Build employee filter
  const employeeFilter = {};

  if (search) {
    employeeFilter.$or = [
      { employeeId: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }

  if (department) {
    employeeFilter.department = department;
  }

  const employees = await Employee.find(employeeFilter).select("_id");

  const employeeIds = employees.map((emp) => emp._id);

  // Leave Balance filter
  const filter = {};

  if (employeeIds.length > 0 || search) {
    filter.employee = { $in: employeeIds };
  }

  if (year) {
    filter.year = Number(year);
  }

  if (leaveType) {
    filter.leaveType = leaveType;
  }

  const totalRecords = await LeaveBalance.countDocuments(filter);

  const leaveBalances = await LeaveBalance.find(filter)
    .populate({
      path: "employee",
      select: "employeeId firstName lastName department",
      populate: {
        path: "department",
        select: "departmentCode departmentName",
      },
    })
    .populate({
      path: "leaveType",
      select: "leaveCode leaveName",
    })
    .sort({
      [sortBy]: order === "asc" ? 1 : -1,
    })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  return {
    totalRecords,
    currentPage,
    totalPages: Math.ceil(totalRecords / pageSize),
    pageSize,
    leaveBalances,
  };
};




const getLeaveBalanceById = async (id) => {

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid leave balance ID.");
  }

  const leaveBalance = await LeaveBalance.findById(id)
    .populate({
      path: "employee",
      select: "employeeId firstName lastName email designation department",
      populate: {
        path: "department",
        select: "departmentCode departmentName",
      },
    })
    .populate({
      path: "leaveType",
      select: "leaveCode leaveName maxDaysPerYear isPaid",
    });

  if (!leaveBalance) {
    throw new Error("Leave balance not found.");
  }

  return leaveBalance;
};


const getEmployeeLeaveBalances = async (employeeId) => {

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error("Invalid employee ID.");
  }

  // Check employee exists
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  // Get leave balances
  const leaveBalances = await LeaveBalance.find({
    employee: employeeId,
  })
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
    .sort({
      createdAt: -1,
    });

  return leaveBalances;
};



const getMyLeaveBalance = async (userId) => {

  // Find employee linked to logged-in user
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error("Employee profile not found.");
  }

  // Get leave balances
  const leaveBalances = await LeaveBalance.find({
    employee: employee._id,
  })
    .populate({
      path: "leaveType",
      select: "leaveCode leaveName maxDaysPerYear isPaid",
    })
    .sort({
      createdAt: -1,
    });

  return leaveBalances;
};


const updateLeaveBalance = async (id, data) => {

  // ==========================================
  // Validate Leave Balance ID
  // ==========================================

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid leave balance ID.");
  }

  // ==========================================
  // Check Leave Balance Exists
  // ==========================================

  const leaveBalance = await LeaveBalance.findById(id);

  if (!leaveBalance) {
    throw new Error("Leave balance not found.");
  }

  // ==========================================
  // Extract Request Data
  // ==========================================

  let {
    employee,
    leaveType,
    allocatedLeave,
    usedLeave,
    year,
  } = data;

  // Keep existing values if not provided

  employee = employee || leaveBalance.employee;
  leaveType = leaveType || leaveBalance.leaveType;
  year = year || leaveBalance.year;

  allocatedLeave =
    allocatedLeave !== undefined
      ? allocatedLeave
      : leaveBalance.allocatedLeave;

  usedLeave =
    usedLeave !== undefined
      ? usedLeave
      : leaveBalance.usedLeave;

  // ==========================================
  // Validate Employee
  // ==========================================

  const employeeExists = await Employee.findById(employee);

  if (!employeeExists) {
    throw new Error("Employee not found.");
  }

  // ==========================================
  // Validate Leave Type
  // ==========================================

  const leaveTypeExists = await LeaveType.findById(leaveType);

  if (!leaveTypeExists) {
    throw new Error("Leave type not found.");
  }

  // ==========================================
  // Duplicate Check
  // ==========================================

  const duplicate = await LeaveBalance.findOne({
    employee,
    leaveType,
    year,
    _id: { $ne: id },
  });

  if (duplicate) {
    throw new Error(
      "Leave balance already exists for this employee and leave type."
    );
  }

  // ==========================================
  // Business Validation
  // ==========================================

  if (usedLeave > allocatedLeave) {
    throw new Error(
      "Used leave cannot exceed allocated leave."
    );
  }

  // ==========================================
  // Auto Calculate Remaining Leave
  // ==========================================

  const remainingLeave =
    allocatedLeave - usedLeave;

  // ==========================================
  // Update Record
  // ==========================================

  leaveBalance.employee = employee;
  leaveBalance.leaveType = leaveType;
  leaveBalance.year = year;
  leaveBalance.allocatedLeave = allocatedLeave;
  leaveBalance.usedLeave = usedLeave;
  leaveBalance.remainingLeave = remainingLeave;

  await leaveBalance.save();

  // ==========================================
  // Return Updated Record
  // ==========================================

  return await LeaveBalance.findById(id)
    .populate({
      path: "employee",
      select: "employeeId firstName lastName department",
      populate: {
        path: "department",
        select: "departmentCode departmentName",
      },
    })
    .populate({
      path: "leaveType",
      select: "leaveCode leaveName maxDaysPerYear isPaid",
    });

};


const deleteLeaveBalance = async (id) => {

  // ==========================================
  // Validate Leave Balance ID
  // ==========================================

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid leave balance ID.");
  }

  // ==========================================
  // Find Leave Balance
  // ==========================================

  const leaveBalance = await LeaveBalance.findById(id);

  if (!leaveBalance) {
    throw new Error("Leave balance not found.");
  }

  // ==========================================
  // Prevent deletion if leave has been used
  // ==========================================

  if (leaveBalance.usedLeave > 0) {
    throw new Error(
      "Cannot delete leave balance because leave has already been used."
    );
  }

  // ==========================================
  // Check Approved Leave Requests
  // ==========================================

  const approvedLeave = await Leave.findOne({
    employee: leaveBalance.employee,
    leaveType: leaveBalance.leaveType,
    status: "Approved",
    year: leaveBalance.year,
  });

  if (approvedLeave) {
    throw new Error(
      "Cannot delete leave balance because approved leave requests exist."
    );
  }

  // ==========================================
  // Delete
  // ==========================================

  await leaveBalance.deleteOne();

  return true;
};




module.exports = {

    createLeaveBalance,
    getAllLeaveBalances,
    getLeaveBalanceById,
    getEmployeeLeaveBalances,
    getMyLeaveBalance,
    updateLeaveBalance,

};