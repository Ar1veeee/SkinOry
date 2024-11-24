"use strict";

const db = require("../config/db");

const Best = {
  addProduct: async (
    name_product,
    category,
    price,
    rating,
    image_url,
    store_url
  ) => {
    const query = `
      INSERT INTO best_products (name_product, category, price, rating, image_url, store_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [name_product, category, price, rating, image_url, store_url],
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  }
    
};

module.exports = { Best };
