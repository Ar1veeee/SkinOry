const express = require("express");
const { BestProducts } = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(verifyToken);

router.get("/best/:user_id", BestProducts);

module.exports = router;
