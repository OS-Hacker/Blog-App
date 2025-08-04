import multer from "multer";
import { Blog } from "../models/blog.model.js";
import slugify from "slugify";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (move this to a config file in production)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (to upload buffer to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    stream.end(fileBuffer);
  });
};

export const getBlogsController = async (req, res) => {
  try {
    const blog = await Blog.find({})
      .populate({
        path: "author",
        select: "userName avatar",
      })
      .sort({ createdAt: -1 });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All Blogs Successfully Get",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

export const singleUserBlogController = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Blog.find({ author: userId })
      .populate("author", "userName avatar email")
      .sort({ createdAt: -1 })
      .lean();

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found for this user",
      });
    }

    const totals = {
      blogs: blogs.length,
      comments: blogs.reduce((sum, blog) => sum + blog.blogStatus.comments, 0),
      likes: blogs.reduce((sum, blog) => sum + blog.blogStatus.likes, 0),
      views: blogs.reduce((sum, blog) => sum + blog.blogStatus.views, 0),
    };

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved user's blogs with statistics",
      totals,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createBlogController = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const author = req.user.id;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "blog-covers");

    const slug = slugify(title, { lower: true, strict: true });

    const blog = await Blog.create({
      title,
      slug,
      content,
      category,
      author,
      coverImage: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      publishedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Blog Created Successfully",
      blog,
    });

    await User.findByIdAndUpdate(author, { $inc: { blogCount: 1 } });
  } catch (error) {
    next(error);
  }
};

export const viewCountController = async (req, res) => {
  try {
    const slug = req.params.slug;
    const userId = req.user?.id;

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const hasViewed = blog.views?.some(
      (viewId) => viewId && viewId.toString() === userId?.toString()
    );

    let updatedBlog = blog;
    if (userId && !hasViewed) {
      updatedBlog = await Blog.findOneAndUpdate(
        { _id: blog._id, views: { $ne: userId } },
        {
          $addToSet: { views: userId },
          $inc: { "blogStatus.views": 1 },
        },
        { new: true, lean: true }
      ).exec();
    }

    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const singleBlogController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug }).lean().populate({
      path: "author",
      select: "userName avatar",
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const updateblogController = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (blog.coverImage?.public_id) {
        await cloudinary.uploader.destroy(blog.coverImage.public_id);
      }

      // Upload new image to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, "blog-covers");

      req.body.coverImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogController = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete cover image from Cloudinary if it exists
    if (blog.coverImage?.public_id) {
      await cloudinary.uploader.destroy(blog.coverImage.public_id);
    }

    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    next(error);
  }
};

export const likeBlogController = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const isAlreadyLiked = blog.likes.some(
      (id) => id && id.toString() === userId.toString()
    );

    if (isAlreadyLiked) {
      blog.likes.pull(userId);
      blog.blogStatus.likes = Math.max(0, blog.blogStatus.likes - 1);
    } else {
      blog.likes.push(userId);
      blog.blogStatus.likes += 1;
    }

    await blog.save();

    res.status(200).json({
      success: true,
      likesCount: blog.blogStatus.likes,
      likedByUser: !isAlreadyLiked,
      message: isAlreadyLiked
        ? "Blog unliked successfully"
        : "Blog liked successfully",
    });
  } catch (error) {
    next(error);
  }
};
