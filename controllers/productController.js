"use strict";
const Product = require("../models/productModel");

exports.BestProducts = async (req, res) => {
  const { user_id } = req.params;

  // Parameter validation
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Retrieve the best product data
    const bestProducts = await Product.getBestProducts(user_id);

    // Submit the results
    res.status(200).json({ bestProducts });
  } catch (error) {
    console.error("Error fetching Best Products:", error.message);
    res.status(500).json({ message: "Error fetching Best Products" });
  }
};
