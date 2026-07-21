const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const departmentRoutes = require("./routes/department.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveTypeRoutes = require("./routes/leaveType.routes");
const leaveRoutes = require("./routes/leave.routes");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/leave-types", leaveTypeRoutes);
app.use("/api/v1/leaves", leaveRoutes);



app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Enterprise HRMS Backend Running...",
  });
});

app.get("/error", (req, res, next) => {
  const error = new Error("This is a test error");
  error.statusCode = 400;
  next(error);
});


// Error Handler (Last Middleware)
app.use(errorHandler);

module.exports = app;