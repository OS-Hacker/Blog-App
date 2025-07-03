import express from "express";
import {
  addComment,
  addReply,
  deleteComment,
  dislikeComment,
  getCommentsByBlog,
  likeComment,
  updateComment,
} from "../controllers/comments.controller.js";
import { isLoggin } from "../middleware/verifyToken.js";

const commentRouter = express.Router();

// get all Blogs
commentRouter.get("/comments/:slug", getCommentsByBlog);

// create
commentRouter.post("/comment/add/:slug", isLoggin, addComment);

// update
commentRouter.put("/comment/edit/:id", isLoggin, updateComment);

// delete
commentRouter.delete("/comment/delete/:id", isLoggin, deleteComment);

// addReply
commentRouter.post("/comment-reply/:id", isLoggin, addReply);

// like
commentRouter.post("/comment-like/:id", isLoggin, likeComment);

// dislike
commentRouter.post("/comment-dislike/:id", isLoggin, dislikeComment);

export default commentRouter;
