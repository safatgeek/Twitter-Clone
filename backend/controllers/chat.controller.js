import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const createOrGetChatForTwoUsers = async (req, res) => {
  const { toId, chatName } = req.body;

  if (!toId) {
    return res.status(400).send({ message: "toId is required" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, toId] },
    })
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      chatName,
      isGroupChat: false,
      users: [req.user._id, toId],
    });

    const fullChat = await Chat.findById(newChat._id).populate({
      path: "users",
      select: "-password",
    });

    return res.status(200).json(fullChat);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "Error in the createOrGetChatForTwoUsers controller" });
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
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      });

    const totalChats = await Chat.countDocuments({ users: { $in: userId } });

    return res.status(200).json({
      chats,
      currentPage: page,
      totalpages: Math.ceil(totalChats / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error in the getUserChats controller" });
  }
};

export const createGroupChat = async (req, res) => {
  const { chatName, userIds } = req.body;

  if (!chatName || !userIds) {
    return res.status(400).json({ error: "Chat Name & Users both required" });
  }

  let arrayOfUsers = JSON.parse(req.body.userIds);

  if (arrayOfUsers.length < 2) {
    return res
      .status(400)
      .json({ error: "More than 2 users are required to create a group chat" });
  }

  arrayOfUsers.push(req.user._id);

  try {
    const groupChats = await Chat.create({
      chatName: req.body.chatName,
      users: arrayOfUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChats._id })
      .populate({
        path: "users",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error in the createGroupChat controller" });
  }
};

export const renameGroup = async (req, res) => {
  const { chatId, newChatName } = req.body;

  const validChatId = await Chat.findById(chatId);

  if (!validChatId) {
    return res.status(400).json({ error: "Chat Id is not valid" });
  }
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: newChatName },
      { new: true }
    )
      .populate({
        path: "users",
        select: "-password",
      })
      .populate("groupAdmin", "-password");

    return res
      .status(200)
      .json({ message: "Group name Updated successfully", updatedChat });
  } catch (error) {
    console.error("Error renaming group:", error);
    return res
      .status(500)
      .json({ error: "Error in the renameGroup controller" });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { userIdToAdd, chatId } = req.body;

    const validChat = await Chat.findById(chatId);

    if (validChat) {
      if (validChat.users.includes(userIdToAdd)) {
        return res.status(400).json({ error: "User aleady exists" });
      }
    } else {
      return res.status(400).json({ error: "Chat Id is not valid" });
    }

    const validUserIdToAdd = await User.findById(userIdToAdd);

    if (!validUserIdToAdd) {
      return res.status(400).json({ error: "User Id is not valid" });
    }

    const updatedChatAfterAdding = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userIdToAdd } },
      { new: true }
    )
      .populate({
        path: "users",
        select: "-password",
      })
      .populate("groupAdmin", "-password");

    return res
      .status(200)
      .json({ message: "User added successfully", updatedChatAfterAdding });
  } catch (error) {
    console.error("Error in adding to group:", error);
    return res
      .status(500)
      .json({ error: "Error in the addToGroup controller" });
  }
};

export const removeFromGroup = async (req, res) => {
  const { userIdToRemove, chatId } = req.body;

  const validChatId = await Chat.findById(chatId);

  if (!validChatId) {
    return res.status(400).json({ error: "Chat Id is not valid" });
  }

  const validUserIdToRemove = await User.findById(userIdToRemove);

  if (!validUserIdToRemove) {
    return res.status(400).json({ error: "User Id is not valid" });
  }

  try {
    const updatedChatAfterRemoving = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userIdToRemove } },
      { new: true }
    )
      .populate({
        path: "users",
        select: "-password",
      })
      .populate("groupAdmin", "-password");

    return res
      .status(200)
      .json({ message: "User removed successfully", updatedChatAfterRemoving });
  } catch (error) {
    console.error("Error in removing user from group:", error);
    return res
      .status(500)
      .json({ error: "Error in the removeFromGroup controller" });
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.query;

  const currentUserId = req.user._id;

  try {
    const chat = await Chat.findById(chatId)

    if(!chat) {
      return res.status(400).json({ error: "Invalid Chat Id"})
    }

    if (chat.isGroupChat && currentUserId != chat.groupAdmin?.toString()) {
      console.log("1")
      return res.status(400).json({ error: "You are not authorized to delete this group", currentUserId, userType: typeof currentUserId, adminType: typeof chat?.groupAdmin?.toString() })
    }

    if (chat.isGroupChat && currentUserId == chat.groupAdmin?.toString()) {
      const deletedChat = await Chat.findByIdAndDelete(chatId);

      console.log("2")
      return res.status(200).json({ message: "Group Chat deleted successfully", deletedChat})
    }
    
    if (chat.isGroupChat == false) {
      const deletedChat = await Chat.findByIdAndDelete(chatId);
      console.log("3")
      return res.status(200).json({ message: "Chat deleted successfully", deletedChat})
    }
    console.log("4", chat.isGroupChat)
  } catch (error) {
    console.error("Error in deleting chat:", error);
    return res
      .status(500)
      .json({ error: "Error in the deleteChat controller" });
  }
};
