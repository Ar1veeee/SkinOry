const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const { updatePassword, Profile } = require("../controllers/profileController");

// Apply verifyToken middleware globally for all routes
router.use(verifyToken);

// Update password and get profile
router.patch("/:user_id", updatePassword);
router.get("/:user_id", Profile);

module.exports = router;