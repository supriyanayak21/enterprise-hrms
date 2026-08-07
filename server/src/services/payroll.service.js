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

const getPayrollById = async (payrollId) => {

  // ==========================================
  // Validate Payroll ID
  // ==========================================

  if (!mongoose.Types.ObjectId.isValid(payrollId)) {
    throw new Error("Invalid payroll ID.");
  }

  // ==========================================
  // Find Payroll
  // ==========================================

  const payroll = await Payroll.findById(payrollId)

    .populate({
      path: "employee",
      select:
        "employeeId firstName lastName email designation department",

      populate: {
        path: "department",
        select: "departmentCode departmentName",
      },
    })

    .populate("salaryStructure")

    .populate(
      "generatedBy",
      "fullName email role"
    );

  // ==========================================
  // Payroll Not Found
  // ==========================================

  if (!payroll) {
    throw new Error("Payroll not found.");
  }

  return payroll;
};


const getEmployeePayrollHistory = async (employeeId, query) => {

  // ==========================================
  // 1. Validate Employee ID
  // ==========================================

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error("Invalid employee ID.");
  }

  // ==========================================
  // 2. Validate Employee
  // ==========================================

  const employee = await Employee.findById(employeeId)
    .populate({
      path: "department",
      select: "departmentCode departmentName",
    });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  // ==========================================
  // 3. Pagination
  // ==========================================

  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  // ==========================================
  // 4. Filters
  // ==========================================

  const filter = {
    employee: employeeId,
  };

  if (query.month) {

    const month = Number(query.month);

    if (month < 1 || month > 12) {
      throw new Error("Invalid payroll month.");
    }

    filter.month = month;
  }

  if (query.year) {

    const year = Number(query.year);

    if (year < 2000 || year > 2100) {
      throw new Error("Invalid payroll year.");
    }

    filter.year = year;
  }

  if (query.paymentStatus) {

    const allowedStatuses = [
      "Pending",
      "Processed",
      "Paid",
    ];

    if (!allowedStatuses.includes(query.paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    filter.paymentStatus = query.paymentStatus;
  }

  // ==========================================
  // 5. Count Payrolls
  // ==========================================

  const totalPayrolls =
    await Payroll.countDocuments(filter);

  // ==========================================
  // 6. Fetch Payroll History
  // ==========================================

  const payrolls = await Payroll.find(filter)
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
    .populate({
      path: "salaryStructure",
      select:
        "basicSalary hra da specialAllowance travelAllowance medicalAllowance grossSalary totalDeductions netSalary",
    })
    .populate({
      path: "generatedBy",
      select: "fullName email role",
    })
    .sort({
      year: -1,
      month: -1,
    })
    .skip(skip)
    .limit(limit);

  // ==========================================
  // 7. Return Result
  // ==========================================

  return {
    employee: {
      _id: employee._id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      designation: employee.designation,
      department: employee.department,
    },

    totalPayrolls,

    currentPage: page,

    totalPages: Math.ceil(
      totalPayrolls / limit
    ),

    payrolls,
  };
};


module.exports = {
  generatePayroll,
    getAllPayrolls,
    getPayrollById,
    getEmployeePayrollHistory

    
};