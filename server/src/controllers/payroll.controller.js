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

module.exports = {
  generatePayroll,
};