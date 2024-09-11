import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getAllMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router()

router.post("/", protectRoute, sendMessage )

router.get("/", protectRoute, getAllMessages)


export default router