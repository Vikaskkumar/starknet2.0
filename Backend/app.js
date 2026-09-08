const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./Routes/auth");
const postRoutes = require("./Routes/createPost");
const userRoutes = require("./Routes/user");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});