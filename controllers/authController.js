"use strict";

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Helper for input validation
const passwordRegex = /^[A-Z].{7,}$/;

// Middleware untuk validasi password
const validatePassword = (password) => {
  return passwordRegex.test(password);
};

// Helper to create JWT token
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

// User Registration
exports.register = async (req, res) => {
  const { username, email, password, skin_type } = req.body;

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and begin with uppercase letters.",
    });
  }

  try {
    // Check if email is already in use
    const existingUser = await User.findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email Already Exist" });

    // Save new user
    await User.createUser(username, email, password, skin_type);
    return res.status(201).json({ message: "Registration Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect Password" });

    // Create token
    const activeToken = generateToken(
      { id: user.id },
      process.env.JWT_SECRET,
      "3d"
    );
    const refreshToken = generateToken(
      { id: user.id },
      process.env.JWT_SECRET,
      "7d"
    );

    await User.createOrUpdateAuthToken(user.id, activeToken, refreshToken);

    // Set cookie refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login Successfully",
      loginResult: {
        userID: user.id,
        username: user.username,
        active_token: activeToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Refresh Active Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token Required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findUserById(decoded.id);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Make sure the token matches the one in the database
    const authRecord = await User.findAuthByUserId(user.id);
    if (!authRecord || authRecord.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }

    // Create new token
    const activeToken = generateToken(
      { id: user.id },
      process.env.JWT_SECRET,
      "1h"
    );

    return res.json({
      message: "Token Updated",
      loginResult: {
        userID: user.id,
        username: user.username,
        active_token: activeToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Invalid or Expired Refresh Token" });
  }
};