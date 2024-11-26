"use strict";

const db = require("../config/db");

const Product = {
  createMultipleProducts: async (products) => {
    return new Promise((resolve, reject) => {
      const values = products.map((product) => [
        product.name_product,
        product.skin_type,
        product.category,
        product.usage_time,
        product.image_url,
        product.price,
        product.rating,
      ]);

      const query = `
        INSERT INTO products (name_product, skin_type, category, usage_time, image_url, price, rating)
        VALUES ?
      `;

      db.query(query, [values], (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
    });
  },

  findProductByNameAndSkinType: (name_product, skin_type) => {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT * FROM products WHERE name_product = ? AND skin_type = ?";
      db.query(query, [name_product, skin_type], (error, results) => {
        if (error) {
          console.error("Error executing query:", error);
          return reject(error);
        }
        resolve(results[0]);
      });
    });
  },

  findProductById: async (product_id) => {
    const query = `
      SELECT * FROM products WHERE id_product = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [product_id], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },
};

module.exports = Product;
