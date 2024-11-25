"use strict";

const Product = require("../models/productModel");

exports.addProduct = async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      message: "Request body must be an array of products",
    });
  }

  for (const product of products) {
    const {
      name_product,
      skin_type,
      category,
      usage_time,
      image_url,
      price,
      rating,
    } = product;
    if (
      !name_product ||
      !skin_type ||
      !category ||
      !usage_time ||
      !image_url ||
      !price ||
      !rating
    ) {
      return res.status(400).json({
        message:
          "All fields are required: name_product, skin_type, category, usage_time, image_url, price, rating",
      });
    }

    try {
      const existingProduct = await Product.findProductByNameAndSkinType(
        name_product,
        usage_time
      );
      if (existingProduct) {
        return res.status(400).json({
          message: `Product "${name_product}" for usage time "${skin_type}" already exists`,
        });
      }
    } catch (error) {
      console.error("Error checking for existing product:", error);
      return res
        .status(500)
        .json({ message: "Failed to check existing products" });
    }
  }
  try {
    await Product.createMultipleProducts(products);
    res.status(201).json({ message: "Products added successfully" });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({
      message: "Failed to add products",
    });
  }
};
