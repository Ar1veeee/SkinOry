const express = require("express");
const { addProducts, BestProducts } = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, addProducts);
router.get("/best/:user_id", verifyToken, BestProducts);

module.exports = router;
