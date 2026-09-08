const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const botConversationSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "USER",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BotConversation", botConversationSchema);
