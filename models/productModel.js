"use strict";

const db = require("../config/db");
const client = require("../config/redistClient");

const Product = {
  // Fetching recommended products based on user's skin type, product category, and product rating
  // with caching in Redis to improve performance
  getBestProducts: async (user_id) => {
    const redisKey = `recommended:${user_id}`;
    const cachedData = await client.get(redisKey);
    if (cachedData) {
      console.log("Data from Redis Cache");
      return JSON.parse(cachedData);
    }

    // Compatible query for MySQL 5.7
    const selectQuery = `
      SELECT
        id_product,
        name_product,
        skin_type,
        category,
        image_url,
        store_url,
        price,
        rating
      FROM (
        SELECT
          p.*,
          @rank := IF(@group = CONCAT(p.skin_type, '-', p.category), @rank + 1, 1) AS rank,
          @group := CONCAT(p.skin_type, '-', p.category)
        FROM (
          SELECT 
            p.id_product,
            p.name_product,
            p.skin_type,
            p.category,
            p.image_url,
            p.store_url,
            p.price,
            p.rating
          FROM products p
          JOIN users u ON u.skin_type = p.skin_type
          WHERE u.id = ?
          ORDER BY p.skin_type, p.category, p.rating DESC
        ) p,
        (SELECT @rank := 0, @group := '') r
      ) ranked
      WHERE ranked.rank <= 3
      ORDER BY ranked.skin_type, ranked.category, ranked.rating DESC;
    `;

    try {
      const results = await new Promise((resolve, reject) => {
        db.query(selectQuery, [user_id], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });

      console.log("Query results:", results);

      if (results.length > 0) {
        await client.set(redisKey, JSON.stringify(results), "EX", 1200); // Cache for 20 minutes
      }

      return results;
    } catch (error) {
      console.error("Error in getBestProducts:", error);
      throw error;
    }
  },

  findProductById: async (product_id) => {
    const query = `
      SELECT * FROM products WHERE id_product = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [product_id], (error, results) => {
        if (error) {
          console.error("Error in findProductById:", error);
          reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },
};

module.exports = Product;