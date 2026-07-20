const Attendance = require("../models/attendance.model");
const Employee = require("../models/employee.model");
const generateAttendanceId = require("../utils/generateAttendanceId");

// Check In
const checkIn = async (req, res, next) => {
  try {
    const { employee } = req.body;

    // Validate input
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    // Check employee exists
    const employeeExists = await Employee.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Get today's start and end time
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if attendance already exists today
    const alreadyCheckedIn = await Attendance.findOne({
      employee,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: "Employee has already checked in today.",
      });
    }

    // Generate Attendance ID
    const attendanceId = await generateAttendanceId();

    // Current time
    const now = new Date();

    // Office starts at 9:00 AM
    const officeStart = new Date(today);
    officeStart.setHours(9, 0, 0, 0);

    const status = now > officeStart ? "Late" : "Present";

    // Create attendance
    const attendance = await Attendance.create({
      attendanceId,
      employee,
      date: now,
      checkIn: now,
      status,
    });

    await attendance.populate(
      "employee",
      "employeeId firstName lastName department"
    );

    res.status(201).json({
      success: true,
      message: "Check-in successful.",
      attendance,
    });

  } catch (error) {
    next(error);
  }
};

// Check Out
const checkOut = async (req, res, next) => {};

// Get All
const getAllAttendance = async (req, res, next) => {};

// Get By ID
const getAttendanceById = async (req, res, next) => {};

module.exports = {
  checkIn,
  checkOut,
  getAllAttendance,
  getAttendanceById,
};