"use strict";

const db = require("../config/db");

const Best = {
  addMultipleProducts: async (bests) => {
    return new Promise((resolve, reject) => {
      const values = bests.map((best) => [
        best.name_product,
        best.skin_type,
        best.category,
        best.price,
        best.rating,
        best.image_url,
        best.store_url,
      ]);

      const query = `
        INSERT INTO best_products (name_product, skin_type, category, price, rating, image_url, store_url)
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
      const query = "SELECT * FROM best_products WHERE name_product = ? AND skin_type = ?";
      db.query(query, [name_product, skin_type], (error, results) => {
        if (error) {
          console.error("Error executing query:", error); 
          return reject(error);
        }
        resolve(results[0]); 
      });
    });
  }, 
}

module.exports = Best;
