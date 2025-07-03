import express from "express";
import connectDB from "./db/connectDb.js";
import blogRouter from "./routes/blogs.routes.js";
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();

// connect database
connectDB();

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
const port = 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));
