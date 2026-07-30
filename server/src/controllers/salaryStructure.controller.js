const SalaryStructureService = require("../services/salaryStructure.service");

const createSalaryStructure = async (req, res, next) => {
  try {
    const salaryStructure =
      await SalaryStructureService.createSalaryStructure(req.body);

    res.status(201).json({
      success: true,
      message: "Salary structure created successfully.",
      salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSalaryStructure,
};