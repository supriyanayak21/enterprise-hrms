const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },

    year: {
      type: Number,
      required: true,
      default: new Date().getFullYear(),
    },

    allocatedLeave: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    usedLeave: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingLeave: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate balances for the same employee, leave type, and year
leaveBalanceSchema.index(
  {
    employee: 1,
    leaveType: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);