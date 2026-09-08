const { Server } = require("socket.io");
const Message = require("./models/Message");
const USER = require("./models/User");
const { handleBotChat } = require("./services/botService");

const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  const connectedUsers = {};

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
    });

    socket.on("send_message", async (data) => {
      try {
        if (data.receiverId === "universal_ai_bot") {
          const dummyUserMessage = {
            _id: new Date().getTime().toString(), // dummy ID
            sender: { _id: data.senderId },
            receiver: "universal_ai_bot",
            content: data.text,
            createdAt: new Date()
          };
          socket.emit("receive_message", dummyUserMessage);


          await handleBotChat(data.senderId, data.text, socket);
          return;
        }

        // 1. Standard User-to-User Flow
        const newMessage = new Message({
          sender: data.senderId,
          receiver: data.receiverId,
          content: data.text
        });
        await newMessage.save();
        const populatedMessage = await newMessage.populate("sender", "_id name");

        // 2. Emit message to receiver (if online) and back to sender
        const receiverSocketId = connectedUsers[data.receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", populatedMessage);
        }
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
};

module.exports = { initSocket };
