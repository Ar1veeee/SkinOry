const express = require("express");
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { getRecommendedProducts, addRoutine, getUserRoutines, updateAppliedStatus } = require("../controllers/routineController");

router.get("/routine/:user_id/:usage_time/:category", verifyToken, getRecommendedProducts);

router.post("/routine/:user_id/:usage_time/:category", verifyToken, addRoutine);

router.get("/routine/:user_id", verifyToken, getUserRoutines);
router.patch("/routine/:user_id/:product_id", verifyToken, updateAppliedStatus);

module.exports = router;
