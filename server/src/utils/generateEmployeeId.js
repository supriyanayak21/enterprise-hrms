const Counter = require("../models/counter.model");

const generateEmployeeId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "employeeId",
    {
      $inc: { sequenceValue: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return `EMP${String(counter.sequenceValue).padStart(4, "0")}`;
};

module.exports = generateEmployeeId;