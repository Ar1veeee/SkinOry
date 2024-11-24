const { createUser, findUserByEmail, User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  const { username, email, password, skin_type } = req.body;
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email Already Exist" });

    await createUser(username, email, password, skin_type);
    res.status(201).json({ message: "Registration Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect Password" });

    const activeToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await User.createOrUpdateAuthToken(user.id, activeToken, refreshToken);

    res.json({
      message: "Login Successfully",
      active_token: activeToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token)
    return res.status(400).json({ message: "Refresh Token Required" });

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);

    const user = await User.findUserById(decoded.id);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const authRecord = await User.findAuthByUserId(user.id);
    if (!authRecord || authRecord.refresh_token !== refresh_token) {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }

    const activeToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Token Updated", active_token: activeToken });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Invalid or Expired Refresh Token" });
  }
};
