const express = require("express");
const { addProduct } = require("../controllers/productController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, addProduct);

module.exports = router;
