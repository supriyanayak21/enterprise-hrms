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
const checkOut = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    // Prevent checkout without check-in
    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Employee has not checked in.",
      });
    }

    // Prevent multiple checkouts
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Employee has already checked out.",
      });
    }

    const now = new Date();

    attendance.checkOut = now;

    // Calculate working hours
    const workingMilliseconds =
      attendance.checkOut.getTime() - attendance.checkIn.getTime();

    const workingHours = workingMilliseconds / (1000 * 60 * 60);

    attendance.workingHours = Number(workingHours.toFixed(2));

    await attendance.save();

    await attendance.populate({
      path: "employee",
      select: "employeeId firstName lastName department",
      populate: {
        path: "department",
        select: "departmentCode departmentName",
      },
    });

    res.status(200).json({
      success: true,
      message: "Check-out successful.",
      attendance,
    });

  } catch (error) {
    next(error);
  }
};

// Get All
const getAllAttendance = async (req, res, next) => {
  try {
    // Search
    const search = req.query.search || "";

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort = req.query.sort || "-date";

    // Filtering
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date Filter
    if (req.query.date) {
      const selectedDate = new Date(req.query.date);

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Search Employee
    let employeeFilter = {};

    if (search) {
      const employees = await Employee.find({
        $or: [
          {
            employeeId: {
              $regex: search,
              $options: "i",
            },
          },
          {
            firstName: {
              $regex: search,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      });

      employeeFilter.employee = {
        $in: employees.map((emp) => emp._id),
      };
    }

    const query = {
      ...filter,
      ...employeeFilter,
    };

    const attendance = await Attendance.find(query)
      .populate({
        path: "employee",
        populate: {
          path: "department",
          select: "departmentCode departmentName",
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalAttendance = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalAttendance / limit),
      totalAttendance,
      attendance,
    });

  } catch (error) {
    next(error);
  }
};

// Get By ID
const getAttendanceById = async (req, res, next) => {};

module.exports = {
  checkIn,
  checkOut,
  getAllAttendance,
  getAttendanceById,
};