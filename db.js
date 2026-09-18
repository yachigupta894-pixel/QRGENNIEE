// db.js

const mongoose = require("mongoose");

// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    // Stop the server if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;