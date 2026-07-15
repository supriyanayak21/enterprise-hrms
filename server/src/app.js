const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Enterprise HRMS Backend Running...");
});

module.exports = app;