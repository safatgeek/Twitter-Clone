import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,  // Optional for naming group chats
    },
    isGroupChat: {
      type: Boolean,
      default: false,  // Whether this is a group chat or not
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to users in this chat (either 2 for private chat or multiple for group)
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',  // Reference to the latest message for performance optimization
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Optional, for group chats only
    },
  },
  { timestamps: true }  // Automatically adds createdAt and updatedAt fields
);

const Chat =  mongoose.model("Chat", chatSchema)

export default Chat;
