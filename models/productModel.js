'use strict';

const db = require("../config/db");

const Product = {
  createProduct: async (
    name_product,
    skin_type,
    category,
    usage_time,
    image_url,
    price,
    rating
  ) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO products (name_product, skin_type, category, usage_time, image_url, price, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name_product,
          skin_type,
          category,
          usage_time,
          image_url,
          price,
          rating,
        ],
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  },

  findProductByNameAndUsageTime: (name_product, usage_time) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE name_product = ? AND usage_time = ?";
      db.query(query, [name_product, usage_time], (error, results) => {
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
