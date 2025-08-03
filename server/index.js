import express from "express";
import ConnectDB from "./db/ConnectDB.js";
import blogRouter from "./routes/blogs.routes.js";
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Add this import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// config dotenv
dotenv.config();

// connect database
ConnectDB();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // This is REQUIRED for cookies/auth
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions)); // Important for PUT, DELETE, etc.

// Other middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use(userRouter);
app.use(blogRouter);
app.use(commentRouter);
app.use("/uploads", express.static(path.join("uploads")));

// server running
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));


// Deployment setup
if (process.env.isDeployMode === "PRODUCTION") {
  // Serve static files from the frontend build folder
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // All other routes should redirect to the frontend's index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}
