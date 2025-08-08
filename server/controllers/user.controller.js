import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "./blog.controller.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

export const signUpController = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return next(new ErrorHandler(400, "All Fields Required"));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler(400, "Email already registered"));
    }

    // Upload avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "user-avatars");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with avatar
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    // Create JWT
    const token = jwt.sign({ id: user._id }, "hdhddhdhdhdhdhhhdhdhdhdhdh", {
      expiresIn: "7d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.isDeployMode === "PRODUCTION",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar.url, // Send just the URL
          role: user.role,
        },
      });
  } catch (error) {
    next(ErrorHandler(error));
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler(400, "Invalid credentials"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler(400, "Invalid credentials"));

    const token = jwt.sign({ id: user._id }, "hdhddhdhdhdhdhhhdhdhdhdhdh", {
      expiresIn: "7d",
    });

    // Set JWT in cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.isDeployMode === "PRODUCTION", // use HTTPS in PRODUCTION
        sameSite: "Strict", // or "Lax" depending on your use case
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar.url, // Send just the URL
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(ErrorHandler(error));
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.isDeployMode === "PRODUCTION",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log(user);
    if (!user) return next(new ErrorHandler(401, "User Not Found"));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(ErrorHandler(error));
  }
};
