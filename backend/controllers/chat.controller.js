import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const createOrGetChat = async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).send({ message: "UserId is required" });
    }
  
    try {
      let chat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] }
      })
        .populate({
            path: "users",
            select: "-password"
        })
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "username fullName profileImg",
            }
        });
  
      if (chat) {
        return res.status(200).json(chat);
      };

      const otherUser = await User.findById(userId).select("fullName")
  
      const newChat = await Chat.create({
        chatName: otherUser?.fullName,
        isGroupChat: false,
        users: [req.user._id, userId]
      });
  
      const fullChat = await Chat.findById(newChat._id)
        .populate({
            path: "users",
            select: "- password"
        });
  
      return res.status(200).json(fullChat);
  
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Failed to access or create chat" });
    }
  };
  