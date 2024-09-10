import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createOrGetChat } from "../controllers/chat.controller.js";

const router = express.Router()

router.post("/", protectRoute, createOrGetChat)

export default router;