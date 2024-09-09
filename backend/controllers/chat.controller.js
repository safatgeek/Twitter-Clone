import Chat from "../models/chat.model.js";

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

