import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});

export const chat = mongoose.model("Chat", chatSchema);
