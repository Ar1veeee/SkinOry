const db = require("../config/db");
const bcrypt = require("bcrypt");

const createUser = async (username, email, password, skin_type) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (username, email, password, skin_type) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, skin_type],
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
};

const updateOldPassword = async (user_id, password) => {
  const newPasswordHash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPasswordHash, user_id],
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    )
  });
};

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      }
    );
  });
};

const User = {
  findUserById: async (user_id) => {
    const query = `
        SELECT * FROM users WHERE id = ?
      `;
    return new Promise((resolve, reject) => {
      db.query(query, [user_id], (error, results) => {
        if (error) reject(error);
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  },

  createOrUpdateAuthToken: (userId, activeToken, refreshToken) => {
    return new Promise((resolve, reject) => {      
      db.query(
        "SELECT * FROM auth WHERE user_id = ?",
        [userId],
        (error, results) => {
          if (error) reject(error);

          if (results.length > 0) {            
            db.query(
              "UPDATE auth SET active_token = ?, refresh_token = ? WHERE user_id = ?",
              [activeToken, refreshToken, userId],
              (updateError, updateResults) => {
                if (updateError) reject(updateError);
                resolve(updateResults);
              }
            );
          } else {            
            db.query(
              "INSERT INTO auth (user_id, active_token, refresh_token) VALUES (?, ?, ?)",
              [userId, activeToken, refreshToken],
              (insertError, insertResults) => {
                if (insertError) reject(insertError);
                resolve(insertResults);
              }
            );
          }
        }
      );
    });
  },

  findAuthByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM auth WHERE user_id = ?",
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0] || null);
        }
      );
    });
  },
};

module.exports = { createUser, findUserByEmail, updateOldPassword, User };
