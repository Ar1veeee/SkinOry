const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const asyncHandler = require("../middlewares/asyncHandler");
const {
  getRecommendedProducts,
  DayRoutine,
  NightRoutine,
  getUserDayRoutines,
  getUserNightRoutines,
  DeleteDayRoutine,
  DeleteNightRoutine,
} = require("../controllers/routineController");

// Middleware untuk memverifikasi token
router.use(verifyToken);

// Route untuk rutinitas harian
router
  .route("/:user_id/day")
  .get(asyncHandler(getUserDayRoutines))
  .delete(asyncHandler(DeleteDayRoutine));

// Route untuk rutinitas malam
router
  .route("/:user_id/night")
  .get(asyncHandler(getUserNightRoutines))
  .delete(asyncHandler(DeleteNightRoutine));

// Route untuk mendapatkan rekomendasi produk
router.get(
  "/:user_id/:category",
  asyncHandler(getRecommendedProducts)
);

// Route untuk menambahkan produk ke rutinitas harian dan malam
router.post(
  "/:user_id/:category/day/:product_id",
  asyncHandler(DayRoutine)
);
router.post(
  "/:user_id/:category/night/:product_id",
  asyncHandler(NightRoutine)
);

module.exports = router;