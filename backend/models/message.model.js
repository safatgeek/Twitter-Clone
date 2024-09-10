import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        trim: true
      },
      chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text',
      },
      image: {
        type: String,  // URL for the image
      },
      file: {
        type: String,  // URL for the file
      },
      fileName: {
        type: String,  // Original file name for files
      },
    },
    { timestamps: true }
  );

const Message = mongoose.model("Message", messageSchema)

export default Message