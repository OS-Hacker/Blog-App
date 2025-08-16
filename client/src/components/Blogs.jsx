import React, { useCallback, useEffect, useState } from "react";
import { baseUrl } from "../pages/Signup";
import axios from "axios";
import Loading from "../pages/Loading";
import { useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaRegHeart } from "react-icons/fa";
import { formatCreatedAt } from "./formatCreatedAt";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-toastify";

/**
 * Blogs Component - Displays a grid of blog cards with like functionality
 */
const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const { auth } = useAuth();
  const Navigate = useNavigate();
  const [likedBlogs, setLikedBlogs] = useState({});

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/get-blogs`);
      setBlogs(res?.data.blog);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const likeBlog = async (blogId) => {
    if (!auth) {
      toast("Please Login", { position: "top-center" });
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/blog/like/${blogId}`);
      const { likedByUser, likesCount } = res.data;
      setLikedBlogs((prev) => ({
        ...prev,
        [blogId]: { likedByUser, likesCount },
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const currentUserId = auth?._id;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="w-[80vw] mx-auto grid gap-8 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] py-16">
        {loading ? (
          <Loading />
        ) : blogs.length > 0 ? (
          blogs.map((blog) => {
            const {
              _id,
              coverImage,
              title,
              category,
              content,
              createdAt,
              author,
              slug,
            } = blog;

            const likeData = likedBlogs[_id] || {};
            const isLiked = likeData.hasOwnProperty("likedByUser")
              ? likeData.likedByUser
              : blog.likes.includes(currentUserId);

            const totalLikes = likeData.likesCount ?? blog.blogStatus.likes;

            return (
              <article
                key={_id}
                onClick={() => Navigate(`/single-blog/${slug}`)}
                className="bg-transparent max-w-[300px] w-full rounded-xl shadow-[0_2px_4px_#ff9800] hover:shadow-[0_4px_12px_#ff9800] transition-all duration-300 hover:-translate-y-1 cursor-pointer mx-auto"
              >
                {/* Blog cover image */}
                <div className="w-full h-[150px] overflow-hidden rounded-t-xl">
                  <img
                    src={coverImage.url}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Blog content */}
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex justify-between">
                    {/* Category */}
                    <span
                      className={`text-white px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2`}
                      style={{
                        backgroundColor: getCategoryColor(category),
                      }}
                    >
                      {category}
                    </span>

                    {/* Views & Likes */}
                    <div
                      className="flex gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <FaEye className="text-gray-400 text-sm" />
                        {blog.blogStatus.views}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          likeBlog(_id);
                        }}
                        className={`flex items-center gap-1 text-sm transition-transform duration-300 hover:scale-110 ${
                          isLiked ? "text-red-500" : "text-gray-500"
                        }`}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        {totalLikes}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[#faf4e8] leading-snug">
                    {title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {content.replace(/<[^>]*>?/gm, " ").substring(0, 100)}...
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between gap-2 border-t pt-3 border-gray-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          author?.avatar
                            ? `${author.avatar.url}`
                            : "/default-avatar.png"
                        }
                        alt={author?.userName || "Anonymous"}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#ff9800] shadow-sm"
                      />
                      <span className="text-gray-400 font-semibold text-sm hover:text-[#ff9800] hover:underline cursor-pointer">
                        {author?.userName || "Unknown User"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatCreatedAt(createdAt)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <p className="flex justify-center items-center min-h-[70vh] text-white text-lg text-center">
            Blog Not Found
          </p>
        )}
      </div>
    </div>
  );
};

export default Blogs;

/**
 * Helper for category colors
 */
const getCategoryColor = (category) => {
  switch (category) {
    case "technology":
      return "#4299e1"; // blue
    case "travel":
      return "#48bb78"; // green
    case "food":
      return "#ed8936"; // orange
    case "lifestyle":
      return "#9f7aea"; // purple
    case "business":
      return "#f56565"; // red
    case "health":
      return "#38b2ac"; // teal
    case "education":
      return "#667eea"; // indigo
    default:
      return "#a0aec0"; // gray
  }
};
