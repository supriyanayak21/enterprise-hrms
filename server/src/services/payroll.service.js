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


const getAllPayrolls = async (query) => {

    const {
        page = 1,
        limit = 10,
        month,
        year,
        paymentStatus,
        employeeId,
        sortBy = "createdAt",
        order = "desc"
    } = query;

    const filter = {};

    if (month) {
        filter.month = Number(month);
    }

    if (year) {
        filter.year = Number(year);
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    // Employee ID Filter
    if (employeeId) {

        const employee = await Employee.findOne({
            employeeId
        });

        if (employee) {
            filter.employee = employee._id;
        } else {
            return {
                totalPayrolls: 0,
                totalPages: 0,
                currentPage: Number(page),
                payrolls: [],
            };
        }
    }

    const totalPayrolls =
        await Payroll.countDocuments(filter);

    const payrolls =
        await Payroll.find(filter)

        .populate({
            path: "employee",
            select:
                "employeeId firstName lastName designation department",

            populate: {
                path: "department",
                select:
                    "departmentCode departmentName",
            },
        })

        .populate(
            "salaryStructure"
        )

        .populate(
            "generatedBy",
            "fullName email role"
        )

        .sort({
            [sortBy]:
                order === "asc" ? 1 : -1,
        })

        .skip((page - 1) * limit)

        .limit(Number(limit));

    return {

        totalPayrolls,

        totalPages: Math.ceil(
            totalPayrolls / limit
        ),

        currentPage: Number(page),

        payrolls,
    };
};




module.exports = {
  generatePayroll,
    getAllPayrolls,
};