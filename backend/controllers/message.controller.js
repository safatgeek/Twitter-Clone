import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Chat from "./../models/chat.model.js";
import { v2 as cloudinary } from "cloudinary";

export const sendMessage = async (req, res) => {
  const { chatId, content, messageType, file, fileName, recipientId } = req.body;

  let { image } = req.body 

  const senderId = req.user._id;

  try {
    if (!messageType) {
      return res.status(400).json({ error: "Message Type are required" });
    }

    let chat;

    if (chatId) {

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }

      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(400).json({ error: "Chat not found" });
      }
    } else {

      if (!recipientId) {
        return res.status(400).json({ error: "recipientId is required for a new chat" });
      }

      chat = await Chat.create({
        isGroupChat: false,
        users: [senderId, recipientId]
      });
    }

    if (!content && !image && !(!file || !fileName)) {
      return res.status(400).json({ error: "Post must have text or image or file !" });
    }

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    let newMessageData = {
      sender: senderId,
      chat: chat._id,
      content: messageType == "text" ? content : "",
      image: messageType == "image" ? image : null,
      file: messageType == "file" ? file : null,
      fileName: messageType == "file" ? fileName : null,
    };

    let message = await Message.create(newMessageData);

    await Chat.findByIdAndUpdate(chat._id, {
      latestMessage: message
    });

    const newMessage = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "-password",
        },
      });

    await chat.save();

    return res.status(200).json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error("Error in sending chat:", error);
    return res
      .status(500)
      .json({ error: "Error in the sendMessage controller" });
  }
};


export const getAllMessages = async (req, res) => {
  try {
    const { chatId, page = 1, limit = 20 } = req.query

    const skip = (page - 1) * limit



    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" })
    }

    const isValidChatId = mongoose.Types.ObjectId.isValid(chatId)

    if (!isValidChatId) {
      return res.status(400).json({ error: "Invalid chatId" });

    }

    const totalMessages = await Message.countDocuments({ chat: chatId})

    if (totalMessages == 0) {
      return res.status(200).json({ message: "No message in this Chat"})
    }

    const messages = await Message.find({ chat: chatId})
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .populate("sender", "-password")
    .populate("chat")

    return res.status(200).json({
      messages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit)
    })
  } catch (error) {
    console.error("Error in fetching messages:", error);
    return res
      .status(500)
      .json({ error: "Error in the getAllMessages controller" });
  }
}


