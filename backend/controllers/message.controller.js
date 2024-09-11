import Message from "../models/message.model.js";
import Chat from "./../models/chat.model.js";

export const sendMessage = async (req, res) => {
  const { chatId, content, messageType, image, file, fileName, recipientId } = req.body;
  const senderId = req.user._id;

  try {
    if (!content || !messageType) {
      return res.status(400).json({ error: "Content and Message Type are required" });
    }

    let chat;

    if (chatId) {

      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(400).json({ error: "Chat not found" });
      }
    } else {

      if (!recipientId) {
        return res.status(400).json({ error: "Recipient is required for a new chat" });
      }

      chat = await Chat.create({
        isGroupChat: false,
        users: [senderId, recipientId]
      });
    }

    let newMessageData = {
      sender: senderId,
      chat: chat._id,
      content: messageType === "text" ? content : "",
      image: messageType === "image" ? image : null,
      file: messageType === "file" ? file : null,
      fileName: messageType === "file" ? fileName : null,
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



export const getMessages = async (req, res) => {
}


