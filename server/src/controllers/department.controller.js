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


// Get All Departments
const getAllDepartments = async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        {
          departmentName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          departmentCode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filtering
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Sorting
    const sort = req.query.sort || "-createdAt";

    const departments = await Department.find(query)
      .populate("manager", "firstName lastName employeeId")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalDepartments =
      await Department.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalDepartments / limit),
      totalDepartments,
      departments,
    });

  } catch (error) {
    next(error);
  }
};


const getDepartmentById = async (req, res, next) => {
  try {

    const department = await Department.findById(req.params.id)
      .populate("manager", "firstName lastName employeeId");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });

  } catch (error) {
    next(error);
  }
};


const updateDepartment = async (req, res, next) => {
  try {

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });

  } catch (error) {
    next(error);
  }
};


const deleteDepartment = async (req, res, next) => {
  try {

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const employeeCount = await Employee.countDocuments({
      department: department._id,
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Department cannot be deleted because employees are assigned to it.",
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,

};