const db = require("../config/db");

const Routine = {
  addRoutine: async (user_id, product_id, usage_time, category) => {
    const query = `
      INSERT INTO routines (user_id, product_id, usage_time, category)
      VALUES (?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id, product_id, usage_time, category], (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  },

  getRoutinesByUserId: async (user_id) => {
    const query = `
      SELECT p.id_product, p.name_product, r.usage_time, r.applied, p.skin_type
      FROM routines r
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

  findRoutineByUserAndProduct: async (user_id, product_id) => {
    const query = `
      SELECT * FROM routines WHERE user_id = ? AND product_id = ?
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

  getRecommendedProducts: async (user_id, usage_time, category) => {
    const query = `
      SELECT p.*
      FROM products p
      JOIN users u ON u.skin_type = p.skin_type
      WHERE u.id = ? AND p.usage_time = ? AND p.category = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id, usage_time, category], (error, results) => {
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
      db.query(query, [applied, user_id, product_id], (error, result) => {
        if (error) {
          reject(error);
        }
        if (result.affectedRows === 0) {
          reject(new Error("No matching routine found to update"));
        }
        resolve(result);
      });
    });
  },
};

module.exports = Routine;
