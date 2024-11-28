"use strict";

const Product = require("../models/productModel");

exports.addProducts = async (req, res) => {
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

exports.BestProducts = async (req, res) => {
  const { user_id } = req.params;
  console.log("User ID from request:", user_id);
  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required"
    });
  }

  try {
    const Best_Products = await Product.getBestProducts(user_id);
    res.status(200).json({ Best_Products })
  } catch (error) {
    console.error("Error fetching Best Products:", error)
    res.status(500).json({
      message: "Error fetching Best Products"
    })
  };
};