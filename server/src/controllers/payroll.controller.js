const PayrollService = require("../services/payroll.service");

const generatePayroll = async (req, res, next) => {
  try {

    const payroll = await PayrollService.generatePayroll(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll,
    });

  } catch (error) {
    next(error);
  }
};

const getAllPayrolls = async (req, res, next) => {
  try {

    const result = await PayrollService.getAllPayrolls(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};


const getPayrollById = async (req, res, next) => {
  try {

    const payroll = await PayrollService.getPayrollById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      payroll,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
};