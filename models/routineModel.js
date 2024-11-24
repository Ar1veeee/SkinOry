'use strict';

const db = require("../config/db");

const Routine = {
  addDayRoutine: async (user_id, product_id, category) => {
    const query = `
      INSERT INTO day_routines (user_id, product_id, category)
      VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [user_id, product_id, category],
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  },

  addNightRoutine: async (user_id, product_id, category) => {
    const query = `
      INSERT INTO night_routines (user_id, product_id, category)
      VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [user_id, product_id, category],
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
    });
  },

  getDayRoutinesByUserId: async (user_id) => {
    const query = `
      SELECT p.id_product, p.name_product, r.applied, p.skin_type
      FROM day_routines r
      JOIN products p ON r.product_id = p.id_product
      WHERE r.user_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },

  getNightRoutinesByUserId: async (user_id) => {
    const query = `
      SELECT p.id_product, p.name_product, r.applied, p.skin_type
      FROM night_routines r
      JOIN products p ON r.product_id = p.id_product
      WHERE r.user_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },

  findDayRoutineByUserAndProduct: async (user_id, product_id) => {
    const query = `
      SELECT * FROM day_routines WHERE user_id = ? AND product_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id, product_id], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },

  findNightRoutineByUserAndProduct: async (user_id, product_id) => {
    const query = `
      SELECT * FROM night_routines WHERE user_id = ? AND product_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id, product_id], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },

  getRecommendedProducts: async (user_id, category) => {
    const query = `
      SELECT p.*
      FROM products p
      JOIN users u ON u.skin_type = p.skin_type
      WHERE u.id = ? AND p.category = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id, category], (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },

  updateAppliedStatus: async (user_id, product_id, applied) => {
    const query = `
      UPDATE routines 
      SET applied = ? 
      WHERE user_id = ? AND product_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [applied ? 1 : 0, user_id, product_id],
        (error, result) => {
          if (error) {
            reject(error);
          }
          if (result.affectedRows === 0) {
            reject(new Error("No matching routine found to update"));
          }
          resolve(result);
        }
      );
    });
  },
};

module.exports = Routine;
