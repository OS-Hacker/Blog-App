import express from "express";
import {
  getCurrentUser,
  loginController,
  logoutUser,
  signUpController,
} from "../controllers/user.controller.js";
import { isLoggin } from "../middleware/verifyToken.js";
import { upload } from "../controllers/blog.controller.js";

const userRouter = express.Router();

// signUp
userRouter.post("/signup", upload.single("avatar"), signUpController);

// login
userRouter.post("/login", loginController);

// Logout
userRouter.post("/logout", logoutUser);

// check user
userRouter.get("/auth/current-user", isLoggin, getCurrentUser);


export default userRouter;
