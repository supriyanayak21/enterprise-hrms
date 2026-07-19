const Counter = require("../models/counter.model");

const generateAttendanceId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "attendanceId",
    {
      $inc: {
        sequenceValue: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return `ATT${String(counter.sequenceValue).padStart(
    4,
    "0"
  )}`;
};

module.exports = generateAttendanceId;