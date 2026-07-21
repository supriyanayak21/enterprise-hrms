const LeaveType = require("../models/leaveType.model");
const Counter = require("../models/counter.model");

// ===============================
// Create Leave Type
// ===============================
const createLeaveType = async (req, res, next) => {
  try {
    const {
      leaveName,
      description,
      maxDaysPerYear,
      isPaid,
      status,
    } = req.body;

    // Validation
    if (!leaveName || !maxDaysPerYear) {
      return res.status(400).json({
        success: false,
        message: "Leave name and maximum days per year are required.",
      });
    }

    // Check duplicate leave name
    const existingLeaveType = await LeaveType.findOne({
      leaveName: leaveName.trim(),
    });

    if (existingLeaveType) {
      return res.status(409).json({
        success: false,
        message: "Leave type already exists.",
      });
    }

    // Generate Leave Code
    const counter = await Counter.findOneAndUpdate(
    { _id: "leaveTypeId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
    );

    const leaveCode = `LV${String(counter.sequenceValue).padStart(3, "0")}`;

    

    // Create Leave Type
    const leaveType = await LeaveType.create({
      leaveCode,
      leaveName,
      description,
      maxDaysPerYear,
      isPaid,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Leave type created successfully.",
      leaveType,
    });

  } catch (error) {
    next(error);
  }
};

const getAllLeaveTypes = async (req, res, next) => {
  try {
    // Search
    const search = req.query.search || "";

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = req.query.sort || "-createdAt";

    // Filter
    const filter = {};

    if (search) {
      filter.leaveName = {
        $regex: search,
        $options: "i",
      };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.isPaid !== undefined) {
      filter.isPaid = req.query.isPaid === "true";
    }

    const leaveTypes = await LeaveType.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalLeaveTypes = await LeaveType.countDocuments(filter);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalLeaveTypes / limit),
      totalLeaveTypes,
      leaveTypes,
    });

  } catch (error) {
    next(error);
  }
};




module.exports = {
  createLeaveType,
  getAllLeaveTypes,
};