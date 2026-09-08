const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const db = require("./config/db");
const { Server } = require("socket.io");

const authRoutes = require("./Routes/auth");
const postRoutes = require("./Routes/createPost");
const userRoutes = require("./Routes/user");
const chatRoutes = require("./Routes/Chat");

const app = express();
const PORT = process.env.PORT || 5000;

db();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
app.use(chatRoutes);


// For production, the frontend will be served by Vercel on a separate domain.
// We no longer need to serve static files from the backend.



const server = app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

const Message = require("./models/Message");
const io = new Server(server, { cors: { origin: "*" } });

// Store connected users: { userId: socket.id }
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Register user socket
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on("send_message", async (data) => {
    try {
      // Save to database
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        content: data.text
      });
      await newMessage.save();
      const populatedMessage = await newMessage.populate("sender", "_id name");

      // Send to receiver if they are online
      const receiverSocketId = connectedUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", populatedMessage);
      }
      
      // Send back to sender to confirm
      socket.emit("receive_message", populatedMessage);
    } catch (err) {
      console.log("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

module.exports = app;