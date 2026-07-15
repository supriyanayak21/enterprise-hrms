require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on Port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("=================================");
});