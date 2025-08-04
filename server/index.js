import express from "express";
import blogRouter from "./routes/blogs.routes.js";
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Add this import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// config dotenv
dotenv.config();

// CORS configuration
// const corsOptions = {
//   origin: "https://blog-app-cpxu.onrender.com",
//   credentials: true, // This is REQUIRED for cookies/auth
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// };

// Apply CORS middleware
app.use(cors());

// connect database
// Replace the simple mongoose.connect with this robust version
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// Other middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use(userRouter);
app.use(blogRouter);
app.use(commentRouter);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// server running
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

// // Deployment setup
// // Production configuration
// if (process.env.isDeployMode === "PRODUCTION") {
//   app.use(express.static(path.join(__dirname, "../client/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
//   });
// }
