const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/user.model");

// ===========================
// Register User
// ===========================

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    // Check Required Fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Validate Email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // Password Length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
};