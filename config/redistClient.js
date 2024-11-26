const redis = require("@redis/client");
require("dotenv").config();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD || null, // Tambahkan jika ada password
});

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
});

// Pastikan memanggil connect() untuk Redis
(async () => {
  try {
    await client.connect();
    console.log("Redis client connected successfully.");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
})();

module.exports = client;
