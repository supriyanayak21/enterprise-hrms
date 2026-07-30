const Employee = require("../models/employee.model");
const SalaryStructure = require("../models/salaryStructure.model");

const createSalaryStructure = async (data) => {

  const {
    employee,
    basicSalary,
    hra = 0,
    da = 0,
    specialAllowance = 0,
    travelAllowance = 0,
    medicalAllowance = 0,
    pf = 0,
    esi = 0,
    professionalTax = 0,
    incomeTax = 0,
    otherDeductions = 0,
  } = data;

  // ==========================================
  // Validate Employee
  // ==========================================

  const employeeExists = await Employee.findById(employee);

  if (!employeeExists) {
    throw new Error("Employee not found.");
  }

  // ==========================================
  // Prevent Duplicate Salary Structure
  // ==========================================

  const existingSalary = await SalaryStructure.findOne({
    employee,
  });

  if (existingSalary) {
    throw new Error(
      "Salary structure already exists for this employee."
    );
  }

  // ==========================================
  // Salary Calculations
  // ==========================================

  const grossSalary =
    Number(basicSalary) +
    Number(hra) +
    Number(da) +
    Number(specialAllowance) +
    Number(travelAllowance) +
    Number(medicalAllowance);

  const totalDeductions =
    Number(pf) +
    Number(esi) +
    Number(professionalTax) +
    Number(incomeTax) +
    Number(otherDeductions);

  const netSalary =
    grossSalary - totalDeductions;

  // ==========================================
  // Create Salary Structure
  // ==========================================

  const salaryStructure =
    await SalaryStructure.create({
      employee,
      basicSalary,
      hra,
      da,
      specialAllowance,
      travelAllowance,
      medicalAllowance,
      pf,
      esi,
      professionalTax,
      incomeTax,
      otherDeductions,
      grossSalary,
      totalDeductions,
      netSalary,
    });

  // ==========================================
  // Return Populated Data
  // ==========================================

  return await SalaryStructure.findById(
    salaryStructure._id
  ).populate({
    path: "employee",
    select: "employeeId firstName lastName designation department",
    populate: {
      path: "department",
      select: "departmentCode departmentName",
    },
  });
};

module.exports = {
  createSalaryStructure,
};