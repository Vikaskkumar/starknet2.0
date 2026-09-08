const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const { initSocket } = require("./socket");

const app = express();
const PORT = process.env.PORT || 5000;

db();

app.use(cors());
app.use(express.json());

app.use(require("./Routes/auth"));
app.use(require("./Routes/createPost"));
app.use(require("./Routes/user"));
app.use(require("./Routes/Chat"));


const server = app.listen(PORT, async () => {
  console.log("Server running on port " + PORT);
});

initSocket(server);

module.exports = app;