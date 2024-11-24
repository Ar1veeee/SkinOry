const Product = require("../models/productModel");

exports.addProduct = async (req, res) => {
  const {
    name_product,
    skin_type,
    category,
    usage_time,
    image_url,
    price,
    rating,
  } = req.body;
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
    const existingProduct = await Product.findProductByNameAndUsageTime(
      name_product,
      usage_time
    );
    if (existingProduct) {
      return res
        .status(400)
        .json({
          message: `Product "${name_product}" for usage time "${usage_time}" already exists`
        });
    }
    await Product.createProduct(
      name_product,
      skin_type,
      category,
      usage_time,
      image_url,
      price,
      rating
    );
    res.status(201).json({ message: "Product Added Successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};
