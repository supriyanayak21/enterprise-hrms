const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    workingDays: {
      type: Number,
      required: true,
    },

    presentDays: {
      type: Number,
      default: 0,
    },

    paidLeaveDays: {
      type: Number,
      default: 0,
    },

    unpaidLeaveDays: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },

    grossSalary: {
      type: Number,
      required: true,
    },

    totalDeductions: {
      type: Number,
      required: true,
    },

    netSalary: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Processed", "Paid"],
      default: "Pending",
    },

    paymentDate: {
      type: Date,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index(
  { employee: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);