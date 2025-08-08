import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comments.model.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";

// Add comment
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { slug } = req.params;
    const authorId = req.user.id;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return next(
        new ErrorHandler(
          400,
          "Comment text is required and must be a non-empty string"
        )
      );
    }

    // Find the blog post
    const blog = await Blog.findOne({ slug }).select("_id comments");
    if (!blog) {
      return next(new ErrorHandler(404, "Blog Not Found"));
    }

    // Create the comment
    const comment = await Comment.create({
      blog: blog._id, // Store the blog's ObjectId rather than slug
      author: authorId,
      text: text.trim(), // Trim whitespace
    });

    // Update the blog's comments array (corrected syntax)
    blog.comments.push(comment._id);

    //  Correctly increment comments count
    blog.blogStatus.comments = +1; // Changed from = +1 to += 1

    await blog.save();

    // Populate author information before sending response
    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "userName avatar"
    ); // Adjust fields as needed

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// Recursive function to get nested replies
async function getNestedComments(comment) {
  const replies = await Comment.find({ parentComment: comment._id })
    .populate("author", "userName avatar")
    .lean();

  for (let reply of replies) {
    reply.replies = await getNestedComments(reply); // recursion
  }

  return replies;
}

// Get all top-level comments + nested replies for a blog
export const getCommentsByBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // 1. Find the blog
    const blog = await Blog.findOne({ slug }).select("_id");

    if (!blog) return next(new ErrorHandler("Blog Not Found", 404));

    // 2. Find only top-level comments (parent: null)
    const comments = await Comment.find({
      blog: blog._id,
      parent: null,
    })
      .populate("author", "userName avatar")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Recursively get replies for each top-level comment
    for (let comment of comments) {
      comment.replies = await getNestedComments(comment);
    }

    // 4. Return
    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// Replay
export const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const parentCommentId = req.params.id;

    console.log(parentCommentId);

    // 1. Create the reply
    const reply = new Comment({
      author: req.user.id,
      text,
      isReply: true,
      parentComment: parentCommentId,
    });

    // 2. Save the reply
    const savedReply = await reply.save();

    // 3. Add reply to parent's replies array
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: savedReply._id },
    });

    // 4. Return the populated reply
    const populatedReply = await Comment.findById(savedReply._id).populate(
      "author",
      "userName avatar"
    );

    res.status(201).json({
      success: true,
      data: populatedReply,
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const { content, userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new ErrorHandler("Comment not found", 404));
    }

    // Optional authorization check
    if (comment.user.toString() !== userId) {
      return next(
        new ErrorHandler("Not authorized to update this comment", 403)
      );
    }

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// Delete comment (only by comment owner or admin)
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);

    if (!comment) return next(new ErrorHandler("Comment not found", 404));

    // Authorization check (optional: req.user.id === comment.user or isAdmin)
    await Comment.findByIdAndDelete(commentId);

    // Also remove from blog.comments[]
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// @desc    Like a comment
// @route   PUT /api/comments/:id/like
// @access  Private
export const likeComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if user already liked the comment
    const comment = await Comment.findById(commentId);
    const alreadyLiked = comment.likes.includes(userId);

    let updatedComment;

    if (alreadyLiked) {
      // Remove like
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // Add like and remove dislike if exists
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $addToSet: { likes: userId },
          $pull: { dislikes: userId },
        },
        { new: true }
      );
    }

    // Populate likes and dislikes count
    const populatedComment = await Comment.findById(
      updatedComment._id
    ).populate("author", "username avatar");

    res.status(200).json({
      success: true,
      data: {
        ...populatedComment.toObject(),
        timestamp: populatedComment.formattedTimestamp,
        likes: populatedComment.likes.length,
        dislikes: populatedComment.dislikes.length,
      },
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// @desc    Dislike a comment
// @route   PUT /api/comments/:id/dislike
// @access  Private
export const dislikeComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check if user already disliked the comment
    const comment = await Comment.findById(commentId);
    const alreadyDisliked = comment.dislikes.includes(userId);

    let updatedComment;

    if (alreadyDisliked) {
      // Remove dislike
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { dislikes: userId } },
        { new: true }
      );
    } else {
      // Add dislike and remove like if exists
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
          $addToSet: { dislikes: userId },
          $pull: { likes: userId },
        },
        { new: true }
      );
    }

    // Populate likes and dislikes count
    const populatedComment = await Comment.findById(
      updatedComment._id
    ).populate("author", "username avatar");

    res.status(200).json({
      success: true,
      data: {
        ...populatedComment.toObject(),
        timestamp: populatedComment.formattedTimestamp,
        likes: populatedComment.likes.length,
        dislikes: populatedComment.dislikes.length,
      },
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};
