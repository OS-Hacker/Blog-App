import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Comments from "./Comments";
import { FaUser } from "react-icons/fa";
import { baseUrl } from "../pages/Signup";

const SingleBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/v1/single-blog/${slug}`);
      setBlog(res.data);

      // Increment view count
      await axios.patch(`${baseUrl}/${slug}/view`);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const getReadingTime = (content) => {
    const text = content?.replace(/<[^>]+>/g, ""); // strip HTML
    const words = text?.split(/\s+/).length || 0;
    return Math.ceil(words / 200);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!blog) return <div className="text-center py-10">Blog not found.</div>;

  return (
    <div className="bg-black min-h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 md:p-10 mt-10 mb-20">
        {/* Cover Image */}
        <img
          src={blog?.coverImage?.url || "/fallback-image.png"}
          alt={blog?.title || "Blog image"}
          className="w-full max-h-[400px] object-cover rounded-lg"
        />

        {/* Blog Header */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {blog?.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-600 text-sm mt-2">
            <span className="flex items-center gap-1">
              <FaUser className="text-gray-500" />
              {blog?.author}
            </span>
            <span>{new Date(blog?.createdAt).toLocaleDateString()}</span>
            <span>{getReadingTime(blog?.content)} min read</span>
            <span>{blog?.views} views</span>
          </div>
        </div>

        {/* Blog Content */}
        <div
          className="prose prose-lg max-w-none mt-6 text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog?.content }}
        />

        {/* Comments Section */}
        <div className="mt-10">
          <Comments blogId={blog?._id} />
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
