const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // Link Employee with User Account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Employee ID
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    // Job Information
    department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },

    designation: {
      type: String,
      required: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Intern", "Contract"],
      default: "Full-Time",
    },

    salary: {
      type: Number,
      required: true,
    },

    // Address
    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    // Emergency Contact
    emergencyContactName: {
      type: String,
      required: true,
    },

    emergencyContactPhone: {
      type: String,
      required: true,
    },

    // Profile
    profileImage: {
      type: String,
      default: "",
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

module.exports = mongoose.model("Employee", employeeSchema);