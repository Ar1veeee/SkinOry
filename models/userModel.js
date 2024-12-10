"use strict";

const db = require("../config/db");
const bcrypt = require("bcrypt");

const executeQuery = async (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const User = {
  // Creates a new user with hashed password and specified skin type
  createUser: async (username, email, password, skin_type) => {
    const query = `
      INSERT INTO users (username, email, password, skin_type) VALUES (?, ?, ?, ?)
    `;
    const hashedPassword = await bcrypt.hash(password, 10);
    return executeQuery(query, [username, email, hashedPassword, skin_type]);
  },

  // Updates an existing user's password
  updateOldPassword: async (user_id, password) => {
    const query = `
      UPDATE users SET password = ? WHERE id = ?
    `;
    const newPasswordHash = await bcrypt.hash(password, 10);
    return executeQuery(query, [newPasswordHash, user_id]);
  },

  // Finds a user by their email address
  findUserByEmail: async (email) => {
    const query = `
      SELECT * FROM users WHERE email = ?
    `;
    const results = await executeQuery(query, [email]);
    return results[0] || null;
  },

  // Finds a user by their unique ID
  findUserById: async (user_id) => {
    const query = `
      SELECT * FROM users WHERE id = ?
    `;
    const results = await executeQuery(query, [user_id]);
    return results[0] || null;
  },

  // Creates or updates authentication tokens for a user
  createOrUpdateAuthToken: async (user_id, activeToken, refreshToken) => {
    const checkQuery = `
      SELECT * FROM auth WHERE user_id = ?
    `;
    const updateQuery = `
      UPDATE auth SET active_token = ?, refresh_token = ? WHERE user_id = ?
    `;
    const insertQuery = `
      INSERT INTO auth (user_id, active_token, refresh_token) VALUES (?, ?, ?)
    `;

    const results = await executeQuery(checkQuery, [user_id]);
    if (results.length > 0) {
      return executeQuery(updateQuery, [activeToken, refreshToken, user_id]);
    } else {
      return executeQuery(insertQuery, [user_id, activeToken, refreshToken]);
    }
  },

  // Finds authentication tokens for a given user ID
  findAuthByUserId: async (userId) => {
    const query = `
      SELECT * FROM auth WHERE user_id = ?
    `;
    const results = await executeQuery(query, [userId]);
    return results[0] || null;
  },
};

module.exports = User;