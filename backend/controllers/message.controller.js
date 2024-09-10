import Message from "../models/message.model.js";
import Chat from "./../models/chat.model.js";

export const sendMessage = async (req, res) => {
  const { chatId } = req.params; // Extract chatId from params

  const { content, messageType, image, file, fileName, recipientId } = req.body;

  const senderId = req.user._id;

  if (String(senderId) === String(recipientId)) {
    return res.status(400).json({ error: "You can't message yourself" });
  }

  let chat;

  // If chatId exists, find the chat
  if (chatId) {
    chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
  }

  // If no chatId was provided, create a new chat between the users
  if (!chat && recipientId) {
    try {
      chat = new Chat({
        isGroupChat: false,
        users: [senderId, recipientId],
      });

      await chat.save();
    } catch (error) {
      return res.status(500).json({ error: "Failed to create chat" });
    }
  }

  try {
    const newMessage = new Message({
      sender: senderId,
      chat: chat?._id, // Use the chat._id (whether new or existing)
      content: messageType === "text" ? content : "",
      image: messageType === "image" ? image : null,
      file: messageType === "file" ? file : null,
      fileName: messageType === "file" ? fileName : null,
    });

    const savedMessage = await newMessage.save();

    await Chat.findByIdAndUpdate(chat?._id, { latestMessage: savedMessage._id });

    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({ error: "Error in sendMessage controller" });
  }
};


export const createOrGetChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User Id is required" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    });

    if (!chat) {
      chat = new Chat({
        isGroupChat: false,
        users: [req.user._id, userId],
      });

      await chat.save();
    }

    return res.status(200).json({ chat });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create or get chat" });
  }
};

export const getUserChats = async (req, res) => {
  const userId = req.user._id;

  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  try {
    const chats = await Chat.find({ users: { $in: userId } })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 })
      .populate("users", "username profileImg")
      .populate("latestMessage");

    return res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get chats" });
  }
};
