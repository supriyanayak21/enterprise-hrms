const LeaveBalanceService = require("../services/leaveBalance.service");

const createLeaveBalance = async (req, res, next) => {
  try {

    const leaveBalance =
      await LeaveBalanceService.createLeaveBalance(req.body);

    res.status(201).json({
      success: true,
      message: "Leave balance created successfully.",
      leaveBalance,
    });

  } catch (error) {
    next(error);
  }
};


const getAllLeaveBalances = async (req, res, next) => {
  try {
    const result = await LeaveBalanceService.getAllLeaveBalances(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


const getLeaveBalanceById = async (req, res, next) => {
  try {
    const leaveBalance = await LeaveBalanceService.getLeaveBalanceById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      leaveBalance,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeLeaveBalances = async (req, res, next) => {
  try {

    const leaveBalances =
      await LeaveBalanceService.getEmployeeLeaveBalances(
        req.params.employeeId
      );

    res.status(200).json({
      success: true,
      totalRecords: leaveBalances.length,
      leaveBalances,
    });

  } catch (error) {
    next(error);
  }
};


const getMyLeaveBalance = async (req, res, next) => {
  try {

    const leaveBalances =
      await LeaveBalanceService.getMyLeaveBalance(req.user.id);

    res.status(200).json({
      success: true,
      totalRecords: leaveBalances.length,
      leaveBalances,
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createLeaveBalance,
    getAllLeaveBalances,
    getLeaveBalanceById,
    getEmployeeLeaveBalances,
    getMyLeaveBalance,
};