const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const generateEmployeeId = require("../utils/generateEmployeeId");

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
   const employeeId = await generateEmployeeId();

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


// Get All Employees
const getAllEmployees = async (req, res, next) => {
  try {

    // Search
    const search = req.query.search || "";

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query
    const query = {
      $or: [
        { employeeId: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ],
    };

     // Add filters here 👇
    if (req.query.department) {
      query.department = req.query.department;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.designation) {
      query.designation = req.query.designation;
    }

     // 4. Sorting
    const sort = req.query.sort || "-createdAt";

    const employees = await Employee.find(query)
      .populate("user", "fullName email role")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const totalEmployees = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalEmployees / limit),
      totalEmployees,
      employees,
    });

  } catch (error) {
    next(error);
  }
};

// Get Employee By ID
const getEmployeeById = async (req, res, next) => {
  try {

    const employee = await Employee.findById(req.params.id)
      .populate("user", "fullName email role");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });

  } catch (error) {
    next(error);
  }
};

// Update Employee
const updateEmployee = async (req, res, next) => {
  try {

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    Object.assign(employee, req.body);

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });

  } catch (error) {
    next(error);
  }
};

// Delete Employee
const deleteEmployee = async (req, res, next) => {
  try {

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,

};