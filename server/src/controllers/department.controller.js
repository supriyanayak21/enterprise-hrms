const Department = require("../models/department.model");
const generateDepartmentCode = require("../utils/generateDepartmentCode");

// Create Department
const createDepartment = async (req, res, next) => {
  try {
    const {
      departmentName,
      description,
      manager,
      status,
    } = req.body;

    if (!departmentName) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    // Check duplicate department
    const existingDepartment = await Department.findOne({
      departmentName,
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists.",
      });
    }

    // Generate department code
    const departmentCode = await generateDepartmentCode();

    const department = await Department.create({
      departmentCode,
      departmentName,
      description,
      manager,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
};