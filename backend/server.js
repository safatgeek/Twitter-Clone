import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auths.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import messageRoutes from "./routes/message.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import searchRoutes from "./routes/search.routes.js"


import connectMongoDB from "./db/connectMongoDB.js";



dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/search", searchRoutes)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectMongoDB()
})