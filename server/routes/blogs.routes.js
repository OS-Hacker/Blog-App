import express from "express";

import {
  createBlogController,
  deleteBlogController,
  getBlogsController,
  likeBlogController,
  singleBlogController,
  singleUserBlogController,
  updateblogController,
  upload,
  viewCountController,
} from "../controllers/blog.controller.js";
import { isLoggin } from "../middleware/verifyToken.js";

const blogRouter = express.Router();

// get all Blogs
blogRouter.get("/blogs", getBlogsController);

// get All single user Blogs
blogRouter.get("/single-user/blogs", isLoggin, singleUserBlogController);

// get Single Blog
blogRouter.get("/single-blog/:slug", singleBlogController);

blogRouter.patch("/:slug/view", isLoggin, viewCountController);

// create
blogRouter.post(
  "/blog/create",
  isLoggin,
  upload,
  createBlogController
);

// update
blogRouter.put(
  "/blog/edit/:id",
  isLoggin,
  upload,
  updateblogController
);

// delete
blogRouter.delete("/blog/delete/:id", isLoggin, deleteBlogController);

// count likes blog
blogRouter.post("/blog/like/:id", isLoggin, likeBlogController);

export default blogRouter;
