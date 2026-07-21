const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    leaveCode: {
      type: String,
      unique: true,
    },

    leaveName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    maxDaysPerYear: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("LeaveType", leaveTypeSchema);