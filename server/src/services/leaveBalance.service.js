const LeaveBalance = require("../models/leaveBalance.model");
const Employee = require("../models/employee.model");
const LeaveType = require("../models/leaveType.model");

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

module.exports = {

    createLeaveBalance,

};