const mongoose = require("mongoose");

async function connectDB() {

  const mongoUrl = process.env.MONGODB_URL;

  try {
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = connectDB;
