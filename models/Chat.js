import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Kis user ki chat hai
  messages: [
    {
      question: { type: String, required: true }, // User ka question
      answer: { type: String, required: true }, // AI ka jawab
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Chat", ChatSchema);
