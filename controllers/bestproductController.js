"use strict";

const { Best } = require("../models/bestproductModel");

exports.BestProduct = async (req, res) => {
  const { name_product, category, price, rating, image_url, store_url } =
    req.body;
  if (
    !name_product ||
    !category ||
    !price ||
    !rating ||
    !image_url ||
    !store_url
  ) {
    return res.status(400).json({
      message:
        "Name Product, Category, Price, Rating, Image URL, Store URL are required",
    });
  }

  try {
    await Best.addProduct(name_product, category, price, rating, image_url, store_url);
    res.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error Added product:", error);
    return res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
};
