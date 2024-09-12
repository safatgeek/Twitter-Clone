import express from "express"
import { protectRoute } from "../middleware/protectRoute.js";
import { searchUsers } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/users" , protectRoute, searchUsers )


export default router;