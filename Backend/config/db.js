const mongoose = require("mongoose");

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}

module.exports = connectDB;
