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


const getMyPayslips = async (user, query) => {

  // ==========================================
  // 1. Validate Logged-in User
  // ==========================================

  if (!user || !user._id) {
    throw new Error("Unauthorized user.");
  }

  // ==========================================
  // 2. Find Employee
  // ==========================================

  const employee = await Employee.findOne({
    user: user._id,
  }).populate({
    path: "department",
    select: "departmentCode departmentName",
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found for this user."
    );
  }

  // ==========================================
  // 3. Pagination
  // ==========================================

  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    100
  );

  const skip = (page - 1) * limit;

  // ==========================================
  // 4. Build Filter
  // ==========================================

  const filter = {
    employee: employee._id,
  };

  // ==========================================
  // 5. Month Filter
  // ==========================================

  if (query.month) {

    const month = Number(query.month);

    if (month < 1 || month > 12) {
      throw new Error("Invalid payroll month.");
    }

    filter.month = month;
  }

  // ==========================================
  // 6. Year Filter
  // ==========================================

  if (query.year) {

    const year = Number(query.year);

    if (year < 2000 || year > 2100) {
      throw new Error("Invalid payroll year.");
    }

    filter.year = year;
  }

  // ==========================================
  // 7. Payment Status Filter
  // ==========================================

  if (query.paymentStatus) {

    const allowedStatuses = [
      "Pending",
      "Processed",
      "Paid",
    ];

    if (
      !allowedStatuses.includes(
        query.paymentStatus
      )
    ) {
      throw new Error(
        "Invalid payment status."
      );
    }

    filter.paymentStatus =
      query.paymentStatus;
  }

  // ==========================================
  // 8. Count Payslips
  // ==========================================

  const totalPayslips =
    await Payroll.countDocuments(filter);

  // ==========================================
  // 9. Fetch Payslips
  // ==========================================

  const payslips = await Payroll.find(filter)

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

    .sort({
      year: -1,
      month: -1,
    })

    .skip(skip)

    .limit(limit);

  // ==========================================
  // 10. Return Payslips
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

    totalPayslips,

    currentPage: page,

    totalPages: Math.ceil(
      totalPayslips / limit
    ),

    payslips,
  };
};


const updatePayroll = async (payrollId, data, user) => {

  // ==========================================
  // 1. Validate Payroll ID
  // ==========================================

  if (!mongoose.Types.ObjectId.isValid(payrollId)) {
    throw new Error("Invalid payroll ID.");
  }

  // ==========================================
  // 2. Find Payroll
  // ==========================================

  const payroll = await Payroll.findById(payrollId);

  if (!payroll) {
    throw new Error("Payroll not found.");
  }

  // ==========================================
  // 3. Prevent Updating Paid Payroll
  // ==========================================

  if (payroll.paymentStatus === "Paid") {
    throw new Error(
      "Paid payroll cannot be modified."
    );
  }

  // ==========================================
  // 4. Allowed Fields
  // ==========================================

  const allowedFields = [
    "workingDays",
    "presentDays",
    "paidLeaveDays",
    "unpaidLeaveDays",
    "overtimeHours",
    "grossSalary",
    "totalDeductions",
    "netSalary",
    "remarks",
  ];

  // ==========================================
  // 5. Update Only Allowed Fields
  // ==========================================

  allowedFields.forEach((field) => {

    if (data[field] !== undefined) {
      payroll[field] = data[field];
    }

  });

  // ==========================================
  // 6. Validate Numeric Values
  // ==========================================

  const numericFields = [
    "workingDays",
    "presentDays",
    "paidLeaveDays",
    "unpaidLeaveDays",
    "overtimeHours",
    "grossSalary",
    "totalDeductions",
    "netSalary",
  ];

  for (const field of numericFields) {

    if (
      payroll[field] !== undefined &&
      payroll[field] < 0
    ) {
      throw new Error(
        `${field} cannot be negative.`
      );
    }

  }

  // ==========================================
  // 7. Validate Attendance
  // ==========================================

  if (
    payroll.presentDays >
    payroll.workingDays
  ) {
    throw new Error(
      "Present days cannot exceed working days."
    );
  }

  // ==========================================
  // 8. Validate Leave Days
  // ==========================================

  if (
    payroll.paidLeaveDays +
    payroll.unpaidLeaveDays >
    payroll.workingDays
  ) {
    throw new Error(
      "Total leave days cannot exceed working days."
    );
  }

  // ==========================================
  // 9. Validate Salary Calculation
  // ==========================================

  const calculatedNetSalary =
    payroll.grossSalary -
    payroll.totalDeductions;

  if (
    Math.abs(
      calculatedNetSalary -
      payroll.netSalary
    ) > 0.01
  ) {
    throw new Error(
      "Net salary must equal gross salary minus total deductions."
    );
  }

  // ==========================================
  // 10. Save
  // ==========================================

  await payroll.save();

  // ==========================================
  // 11. Return Populated Payroll
  // ==========================================

  const updatedPayroll =
    await Payroll.findById(payroll._id)

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
      })

      .populate({
        path: "generatedBy",
        select: "fullName email role",
      });

  return updatedPayroll;
};


module.exports = {
  generatePayroll,
    getAllPayrolls,
    getPayrollById,
    getEmployeePayrollHistory,
    getMyPayslips,
    updatePayroll

    
};