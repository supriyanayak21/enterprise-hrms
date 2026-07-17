const Employee = require("../models/employee.model");
const User = require("../models/user.model");

// Create Employee
const createEmployee = async (req, res, next) => {
  try {
    const {
      user,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      department,
      designation,
      joiningDate,
      employmentType,
      salary,
      address,
      city,
      state,
      country,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    // Check required fields
    if (
      !user ||
      !firstName ||
      !lastName ||
      !gender ||
      !dateOfBirth ||
      !phone ||
      !department ||
      !designation ||
      !joiningDate ||
      !salary
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }



    const existingUser = await User.findById(user);

    if (!existingUser) {
        return res.status(404).json({
        success: false,
        message: "User not found.",
    });
    }

    
    // Check if employee already exists for this user
    const existingEmployee = await Employee.findOne({ user });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists for this user.",
      });
    }

    // Generate Employee ID
    const count = await Employee.countDocuments();

    const employeeId = `EMP${String(count + 1).padStart(4, "0")}`;

    // Create Employee
    const employee = await Employee.create({
      user,
      employeeId,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      department,
      designation,
      joiningDate,
      employmentType,
      salary,
      address,
      city,
      state,
      country,
      emergencyContactName,
      emergencyContactPhone,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
};