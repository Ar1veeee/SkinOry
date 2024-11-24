const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const { BestProduct } = require("../controllers/bestproductController");

router.post("/best", verifyToken, BestProduct);

module.exports = router;
