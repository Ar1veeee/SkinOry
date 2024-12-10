"use strict";
const Product = require("../models/productModel");

exports.BestProducts = async (req, res) => {
  const { user_id } = req.params;

  // Validasi parameter
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Ambil data produk terbaik
    const bestProducts = await Product.getBestProducts(user_id);

    // Kirimkan hasil
    res.status(200).json({ bestProducts });
  } catch (error) {
    console.error("Error fetching Best Products:", error.message);
    res.status(500).json({ message: "Error fetching Best Products" });
  }
};
