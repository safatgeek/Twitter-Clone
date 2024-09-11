import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router()

router.post("/", protectRoute, sendMessage )

router.get("/:chatId", protectRoute, getMessages)


export default router