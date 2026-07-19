const Counter = require("../models/counter.model");

const generateDepartmentCode = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "departmentId",
    {
      $inc: { sequenceValue: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return `DEP${String(counter.sequenceValue).padStart(4, "0")}`;
};

module.exports = generateDepartmentCode;