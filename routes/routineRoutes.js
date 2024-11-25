const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const {
  getRecommendedProducts,
  DayRoutine,
  NightRoutine,
  getUserDayRoutines,
  getUserNightRoutines,
  DeleteDayRoutine,
  DeleteNightRoutine,
} = require("../controllers/routineController");

router.get("/:user_id/day", verifyToken, getUserDayRoutines);
router.delete("/:user_id/day", verifyToken, DeleteDayRoutine);
router.get("/:user_id/night", verifyToken, getUserNightRoutines);
router.delete("/:user_id/night", verifyToken, DeleteNightRoutine);

router.get("/:user_id/:category", verifyToken, getRecommendedProducts);

router.post("/:user_id/:category/day", verifyToken, DayRoutine);
router.post("/:user_id/:category/night", verifyToken, NightRoutine);

module.exports = router;
