const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updatePassword,
  refreshToken,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login, refreshToken);
router.patch("/profile/:user_id", updatePassword);
router.post("/refresh", refreshToken);

module.exports = router;
