const mongoose = require("mongoose");

const Payroll = require("../models/payroll.model");
const Employee = require("../models/employee.model");
const SalaryStructure = require("../models/salaryStructure.model");
const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");


const generatePayroll = async (data, user) => {

   const {
        employee,
        month,
        year,
        remarks
    } = data;


    if (!mongoose.Types.ObjectId.isValid(employee)) {
    throw new Error("Invalid employee ID.");
    }

    const employeeData = await Employee.findById(employee)
    .populate("department");

     if (!employeeData) {
    throw new Error("Employee not found.");
    }

    if (employeeData.status !== "Active") {
    throw new Error(
        "Payroll cannot be generated for an inactive employee."
    );
   }

   if (month < 1 || month > 12) {
    throw new Error("Invalid payroll month.");
   }

   if (year < 2024) {
    throw new Error("Invalid payroll year.");
   }

   const existingPayroll = await Payroll.findOne({
    employee,
    month,
    year,
});

if (existingPayroll) {
    throw new Error(
        "Payroll already generated for this employee."
    );
}

const salaryStructure = await SalaryStructure.findOne({
    employee,
    status: "Active",
});

if (!salaryStructure) {
    throw new Error(
        "Active salary structure not found."
    );
}

};

module.exports = {
  generatePayroll,
};