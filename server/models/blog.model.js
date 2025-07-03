import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    }, // e.g., "how-to-learn-react"
    content: {
      type: String,
      required: true,
      minlength: [200, "Content too short (min 200 chars)"],
    },
    category: {
      type: String,
      // required: true,
    },
    coverImage: {
      type: String,
      // required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      // required: true,
    },
    likes: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    publishedAt: {
      type: Date,
    },
    blogStatus: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Indexes for performance
blogSchema.index({ title: "text", content: "text" }); // Full-text search
blogSchema.index({ author: 1, status: 1 }); // Faster querying

export const Blog = mongoose.model("Blog", blogSchema);
