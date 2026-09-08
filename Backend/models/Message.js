const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: ObjectId,
      ref: "USER", // References your user model
      required: true,
    },

    receiver: {
      type: ObjectId,
      ref: "USER",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
