import path from "path";
import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auths.routes.js"
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import notificationRoutes from "./routes/notification.routes.js"


import connectMongoDB from "./db/connectMongoDB.js";



dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

if (process.env.NODE_ENV === "production") {
    // Serve static files from the 'frontend/dist' folder
    app.use(express.static(path.join(__dirname, "frontend", "dist")));

    // Handle all routes by serving the 'index.html' from the build folder
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectMongoDB()
})