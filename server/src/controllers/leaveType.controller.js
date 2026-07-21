const LeaveType = require("../models/leaveType.model");
const Counter = require("../models/counter.model");
const mongoose = require("mongoose");
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

// ===========================================
// Get Leave Type By ID
// ===========================================
const getLeaveTypeById = async (req, res, next) => {
  try {
    

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
    success: false,
    message: "Invalid Leave Type ID.",
    });
    }


    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    res.status(200).json({
      success: true,
      leaveType,
    });

  } catch (error) {
    next(error);
  }
};




// ===========================================
// Update Leave Type
// ===========================================
const updateLeaveType = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave Type ID.",
      });
    }

    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    const {
      leaveName,
      description,
      maxDaysPerYear,
      isPaid,
      status,
    } = req.body;

    // Required field validation
    if (!leaveName || !maxDaysPerYear) {
      return res.status(400).json({
        success: false,
        message: "Leave name and maximum days per year are required.",
      });
    }

    // Check duplicate leave name
    const existingLeaveType = await LeaveType.findOne({
      leaveName: {
        $regex: `^${leaveName.trim()}$`,
        $options: "i",
      },
      _id: { $ne: req.params.id },
    });

    if (existingLeaveType) {
      return res.status(409).json({
        success: false,
        message: "Leave type already exists.",
      });
    }

    // Update fields
    leaveType.leaveName = leaveName;
    leaveType.description = description;
    leaveType.maxDaysPerYear = maxDaysPerYear;
    leaveType.isPaid = isPaid;
    leaveType.status = status;

    await leaveType.save();

    res.status(200).json({
      success: true,
      message: "Leave type updated successfully.",
      leaveType,
    });

  } catch (error) {
    next(error);
  }
};


// ===========================================
// Delete Leave Type
// ===========================================
const deleteLeaveType = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Leave Type ID.",
      });
    }

    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found.",
      });
    }

    // Enterprise Validation
    // Uncomment this after creating Leave Model

    /*
    const leaveExists = await Leave.exists({
      leaveType: req.params.id,
    });

    if (leaveExists) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this leave type because it is already assigned to leave records.",
      });
    }
    */

    await leaveType.deleteOne();

    res.status(200).json({
      success: true,
      message: "Leave type deleted successfully.",
    });

  } catch (error) {
    next(error);
  }
};






module.exports = {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
    deleteLeaveType,

};