const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI defined in .env (MONGO_URI).
 * Call this once, from server.js, before starting the HTTP server.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
