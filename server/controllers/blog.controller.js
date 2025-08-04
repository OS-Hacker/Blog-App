import multer from "multer";
import { Blog } from "../models/blog.model.js";
import fs from "fs";
import path from "path"; // Add this import
import slugify from "slugify";
import { User } from "../models/user.model.js";


// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the verified upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

// Multer middleware
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const validTypes = /jpe?g|png|gif/;
    const isValidMime = validTypes.test(file.mimetype);
    const isValidExt = validTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (isValidMime && isValidExt) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
  }
}).single('coverImage')


export const getBlogsController = async (req, res) => {
  try {
    const blog = await Blog.find({})
      .populate({
        path: "author",
        select: "userName avatar", // Only include userName and avatar fields
      })
      .sort({ createdAt: -1 }); // Sort by newest first (-1 for descending)

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

    // Find all blogs where the author matches the user's id
    const blogs = await Blog.find({ author: userId })
      .populate("author", "userName avatar email") // Only populate necessary fields
      .sort({ createdAt: -1 }) // Sort by newest first (-1 for descending)
      .lean(); // Optional: convert to plain JS objects for better performance

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found for this user",
      });
    }

    // Calculate totals across all blogs
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
    const author = req.user.id; // From auth middleware

    // 1. Validation
    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "cover-images is required" });
    }

    // 2. Handle image upload with Multer
    // At the top of your file
    const UPLOADS_DIR = path.join("public", "uploads");

    // In createBlogController
    let coverImagePath = "";
    if (req.file) {
      coverImagePath = path
        .join("/uploads", req.file.filename)
        .replace(/\\/g, "/"); // Ensure forward slashes for URLs
    }
    // 3. Create slug
    const slug = slugify(title, { lower: true, strict: true });

    // 4. Create blog
    const blog = await Blog.create({
      title,
      slug,
      content,
      category,
      author,
      coverImage: coverImagePath,
      publishedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Blog Created Successfully",
      blog,
    });

    // 5. Update user's blog count
    await User.findByIdAndUpdate(author, { $inc: { blogCount: 1 } });
  } catch (error) {
    next(error);
  }
};

// Increment view count
export const viewCountController = async (req, res) => {
  try {
    const slug = req.params.slug;
    const userId = req.user?.id; // Assuming you have user info in req.user

    console.log(slug);

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user already viewed
    const hasViewed = blog.views?.some(
      (viewId) => viewId && viewId.toString() === userId?.toString()
    );

    // Update only if needed
    let updatedBlog = blog;
    if (userId && !hasViewed) {
      updatedBlog = await Blog.findOneAndUpdate(
        { _id: blog._id, views: { $ne: userId } }, // Use _id for more precise matching
        {
          $addToSet: { views: userId }, // Track user ID
          $inc: { "blogStatus.views": 1 }, // Increment view count
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
    // const userId = req.user?.id; // Optional chaining for safety

    // 1. Find the blog (lean for better performance)
    const blog = await Blog.findOne({ slug }).lean().populate({
      path: "author",
      select: "userName avatar", // Only include userName and avatar fields
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 4. Respond (convert to object if still lean)
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

// update blog
export const updateblogController = async (req, res, next) => {
  try {
    // 1. Check if blog exists and user is authorc
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // If new image uploaded
    if (req.file) {
      // Delete old image if it exists
      if (blog.coverImage) {
        const oldImagePath = path.join("public", blog.coverImage); // correct path
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // deletes the old image
          console.log("Previous image deleted:", blog.coverImage);
        }
      }

      // Set new image path in request body
      req.body.coverImage = `/uploads/blogs-cover/${req.file.filename}`;
    }

    // 3. Update slug if title changed
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    // 5. Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

// delete blog
export const deleteBlogController = async (req, res, next) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete cover image if it exists
    if (blog.coverImage) {
      const imagePath = path.join("public", blog.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Synchronously delete the image file
        console.log("Deleted image:", blog.coverImage);
      }
    }

    // Delete the blog from DB
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

    // Check if already liked
    const isAlreadyLiked = blog.likes.some(
      (id) => id && id.toString() === userId.toString()
    );

    console.log(isAlreadyLiked);

    if (isAlreadyLiked) {
      blog.likes.pull(userId); // remove user ID
      blog.blogStatus.likes = Math.max(0, blog.blogStatus.likes - 1); // decrease count safely
    } else {
      blog.likes.push(userId); // add user ID
      blog.blogStatus.likes += 1; // increase count
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
