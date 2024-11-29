"use strict";

const db = require("../config/db");
const client = require("../config/redistClient");

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

  //Use this if you not using Memorystore Redis
  /*
  getBestProducts: async (user_id) => {    
    const setRankQuery = `SET @rank = 0;`;
    const setSkinTypeCategoryQuery = `SET @skin_type_category = '';`;
    const selectQuery = `
      SELECT
        id_product,
        name_product,
        skin_type,
        category,
        image_url,
        price,
        rating
      FROM (
        SELECT
          p.id_product,
          p.name_product,
          p.skin_type,
          p.category,
          p.image_url,
          p.price,
          p.rating,
          @rank := IF(@skin_type_category = CONCAT(p.skin_type, '-', p.category), @rank + 1, 1) AS rank,
          @skin_type_category := CONCAT(p.skin_type, '-', p.category) AS group_key
        FROM
          products p
        JOIN users u ON u.skin_type = p.skin_type
        WHERE
          u.id = ?
        ORDER BY
          p.skin_type,
          p.category,
          p.rating DESC
      ) AS RankedProducts
      WHERE
        rank <= 3
      ORDER BY
        skin_type,
        category,
        rating DESC;
    `;
      
    try {      
      await new Promise((resolve, reject) => {
        db.query(setRankQuery, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
        
      await new Promise((resolve, reject) => {
        db.query(setSkinTypeCategoryQuery, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
        
      const results = await new Promise((resolve, reject) => {
        db.query(selectQuery, [user_id], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });
      console.log("Query results:", results);       
      return results;
    } catch (error) {
      console.error("Error in getBestProducts:", error);
      throw error;
    }
  },
  */
 
 //Use this if you using Memorystore Redis
  getBestProducts: async (user_id) => {
    const redisKey = `recommendede:${user_id}`;    
    const cachedData = await client.get(redisKey);
    if (cachedData) {
      console.log("Data from Redis Cache");
      return JSON.parse(cachedData);
    }
  
    const setRankQuery = `SET @rank = 0;`;
    const setSkinTypeCategoryQuery = `SET @skin_type_category = '';`;
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
          p.id_product,
          p.name_product,
          p.skin_type,
          p.category,
          p.image_url,
          p.store_url,
          p.price,
          p.rating,
          @rank := IF(@skin_type_category = CONCAT(p.skin_type, '-', p.category), @rank + 1, 1) AS rank,
          @skin_type_category := CONCAT(p.skin_type, '-', p.category) AS group_key
        FROM
          products p
        JOIN users u ON u.skin_type = p.skin_type
        WHERE
          u.id = ?
        ORDER BY
          p.skin_type,
          p.category,
          p.rating DESC
      ) AS RankedProducts
      WHERE
        rank <= 3
      ORDER BY
        skin_type,
        category,
        rating DESC;
    `;
      
    try {      
      await new Promise((resolve, reject) => {
        db.query(setRankQuery, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
        
      await new Promise((resolve, reject) => {
        db.query(setSkinTypeCategoryQuery, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
        
      const results = await new Promise((resolve, reject) => {
        db.query(selectQuery, [user_id], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });
  
      console.log("Query results:", results);
        
      await client.set(redisKey, JSON.stringify(results), "EX", 3600);
  
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
          reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },
};

module.exports = Product;
