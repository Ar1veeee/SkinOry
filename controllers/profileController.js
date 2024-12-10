"use strict";

const User = require("../models/userModel");

// Update User's Password
exports.updatePassword = async (req, res) => {
  const { user_id } = req.params;
  const { newPassword } = req.body;

  // Validate password format
  const passwordRegex = /^[A-Z].{7,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and begin with an uppercase letter.",
    });
  }

  try {
    const result = await User.updateOldPassword(user_id, newPassword);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found or password was not updated.",
      });
    }
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(`Error updating password for user_id ${user_id}:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get User's Profile
exports.Profile = async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      profile: {
        userID: user.id,
        username: user.username,
        skin_type: user.skin_type,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`Error fetching profile for user_id ${user_id}:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
};