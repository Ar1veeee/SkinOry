"use strict";
const client = require("../config/redistClient");
const db = require("../config/db");

// Utility function for executing queries
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return reject(error);
      }
      resolve(results);
    });
  });
};

const Routine = {
  // Adds a product to the user's routine (day or night)
  addRoutine: async (user_id, product_id, category, table) => {
    const query = `
      INSERT INTO ${table} (user_id, product_id, category)
      VALUES (?, ?, ?)
    `;
    return executeQuery(query, [user_id, product_id, category]);
  },

  // Retrieves all products in the user's routine (day or night)
  getRoutinesByUserId: async (user_id, table) => {
    const query = `
      SELECT p.id_product, p.name_product, p.skin_type, p.category
      FROM ${table} r
      JOIN products p ON r.product_id = p.id_product
      WHERE r.user_id = ?
    `;
    return executeQuery(query, [user_id]);
  },

  // Deletes all routines for a given user ID (day or night)
  deleteRoutinesByUserId: async (user_id, table) => {
    const query = `
      DELETE FROM ${table} WHERE user_id = ?
    `;
    return executeQuery(query, [user_id]);
  },

  // Finds a specific product in the user's routine (day or night)
  findRoutineByUserAndProduct: async (user_id, product_id, table) => {
    const query = `
      SELECT * FROM ${table} WHERE user_id = ? AND product_id = ?
    `;
    const results = await executeQuery(query, [user_id, product_id]);
    return results.length > 0 ? results[0] : null;
  },

  // Fetch recommended products based on user's skin type and product category, with Redis caching
  getRecommendedProducts: async (user_id, category) => {
    const redisKey = `recommended:${user_id}:${category}`;
    const cachedData = await client.get(redisKey);
    if (cachedData) {
      console.log("Data from Redis cache");
      return JSON.parse(cachedData);
    }

    const query = `
      SELECT p.*
      FROM products p
      JOIN users u ON u.skin_type = p.skin_type
      WHERE u.id = ? AND p.category = ?
    `;
    const results = await executeQuery(query, [user_id, category]);

    if (results.length > 0) {
      await client.set(redisKey, JSON.stringify(results), "EX", 3600); // Cache for 1 hour
    }

    return results;
  },
};

// Expose day and night-specific routines
Routine.addDayRoutine = (user_id, product_id, category) =>
  Routine.addRoutine(user_id, product_id, category, "day_routines");

Routine.addNightRoutine = (user_id, product_id, category) =>
  Routine.addRoutine(user_id, product_id, category, "night_routines");

Routine.getDayRoutinesByUserId = (user_id) =>
  Routine.getRoutinesByUserId(user_id, "day_routines");

Routine.getNightRoutinesByUserId = (user_id) =>
  Routine.getRoutinesByUserId(user_id, "night_routines");

Routine.deleteDayRoutinesByUserId = (user_id) =>
  Routine.deleteRoutinesByUserId(user_id, "day_routines");

Routine.deleteNightRoutinesByUserId = (user_id) =>
  Routine.deleteRoutinesByUserId(user_id, "night_routines");

Routine.findDayRoutineByUserAndProduct = (user_id, product_id) =>
  Routine.findRoutineByUserAndProduct(user_id, product_id, "day_routines");

Routine.findNightRoutineByUserAndProduct = (user_id, product_id) =>
  Routine.findRoutineByUserAndProduct(user_id, product_id, "night_routines");

module.exports = Routine;
