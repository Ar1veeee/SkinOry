const db = require("../config/db");

const Product = {
  createProduct: async (name_product, skin_type, category, usage_time, image_url, price, rating) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO products (name_product, skin_type, category, usage_time, image_url, price, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name_product, skin_type, category, usage_time, image_url, price, rating],
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
    });
  },

  findProductByName: (name_product) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM products WHERE name_product = ?",
        [name_product],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]); 
        }
      );
    });
  },

  getFilteredProducts: async (skin_type, usage_time) => {
    const query = `
      SELECT * 
      FROM products 
      WHERE skin_type = ? AND usage_time = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [skin_type, usage_time], (error, rows) => {
        if (error) {
          reject(error);
        }
        resolve(rows);
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
