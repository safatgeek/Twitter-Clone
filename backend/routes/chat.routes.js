import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { addToGroup, createGroupChat, createOrGetChatForTwoUsers, deleteChat, getUserChats, removeFromGroup, renameGroup } from "../controllers/chat.controller.js";

const router = express.Router()

router.post("/", protectRoute, createOrGetChatForTwoUsers)
router.get("/", protectRoute, getUserChats)
router.post("/group", protectRoute, createGroupChat)
router.post("/group/rename", protectRoute, renameGroup)
router.put("/group/add", protectRoute, addToGroup)

router.delete("/", protectRoute, deleteChat)



export default router;