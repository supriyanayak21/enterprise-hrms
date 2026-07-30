const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    // Employee
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    // Earnings
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    hra: {
      type: Number,
      default: 0,
      min: 0,
    },

    da: {
      type: Number,
      default: 0,
      min: 0,
    },

    specialAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    travelAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    medicalAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Deductions
    pf: {
      type: Number,
      default: 0,
      min: 0,
    },

    esi: {
      type: Number,
      default: 0,
      min: 0,
    },

    professionalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    incomeTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherDeductions: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Auto Calculated
    grossSalary: {
      type: Number,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);