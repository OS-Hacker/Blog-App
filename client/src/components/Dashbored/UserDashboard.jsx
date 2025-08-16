import React, { useEffect, useState } from "react";
import {
  BarChart2,
  FileText,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../pages/Signup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [counterData, serCounterData] = useState([]);

  const getUsersBlogs = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/single-user/blogs`);
      setBlogs(data?.blogs);
      serCounterData(data?.totals);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsersBlogs();
  }, []);

  const totalBlogs = counterData?.blogs;
  const totalComments = counterData?.comments;

  const stats = [
    {
      title: "Total Articles",
      value: totalBlogs,
      icon: <FileText size={20} />,
    },
    {
      title: "Comments",
      value: totalComments,
      icon: <Users size={20} />,
    },
    {
      title: "Avg. Read Time",
      value: "3.2 min",
      icon: <Clock size={20} />,
    },
    {
      title: "Engagement Rate",
      value: "62%",
      icon: <BarChart2 size={20} />,
    },
  ];

  // delete blog
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this blog?"
      );
      if (!confirmDelete) return;

      const res = await axios.delete(`${baseUrl}/blog/delete/${id}`);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      toast.success(res?.data?.message || "Blog deleted successfully", {
        position: "top-center",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog", {
        position: "top-center",
      });
      console.error("Delete error:", error);
    }
  };

  // Edit Blog
  const navigate = useNavigate();
  const handleEdit = (slug) => {
    navigate(`/edit-blog/${slug}`);
  };

  return (
    <div className="min-h-[92vh] max-w-[1400px] mt-16 px-4 md:px-8 bg-black animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-1">
          Welcome back! Here's what's happening with your content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:translate-y-[-4px] transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-sm text-slate-300">{stat.title}</h3>
              <p className="text-xl font-bold text-yellow-400">
                {stat.value || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Blogs List */}
      <div className="bg-white/5 rounded-xl p-6">
        {blogs.length > 0 ? (
          <>
            {/* Table for medium+ screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[768px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-white/10">
                    {[
                      "Article Name",
                      "Category",
                      "Likes",
                      "Comments",
                      "Views",
                      "Actions",
                    ].map((header, i) => (
                      <th
                        key={i}
                        className="text-left p-4 text-yellow-50 border-b border-slate-700 font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((article) => (
                    <tr
                      key={article._id}
                      className="hover:bg-white/5 transition"
                    >
                      <td className="p-4 text-slate-100">
                        {article.title.substring(0, 50)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded text-white ${
                            article.category === "technology"
                              ? "bg-blue-500"
                              : article.category === "travel"
                              ? "bg-green-500"
                              : article.category === "food"
                              ? "bg-orange-500"
                              : article.category === "lifestyle"
                              ? "bg-purple-500"
                              : article.category === "business"
                              ? "bg-red-500"
                              : article.category === "health"
                              ? "bg-teal-500"
                              : article.category === "education"
                              ? "bg-indigo-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {article.category}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2 text-slate-100">
                        <Heart size={16} className="text-yellow-400" />{" "}
                        {article?.blogStatus?.likes}
                      </td>
                      <td className="p-4 flex items-center gap-2 text-slate-100">
                        <MessageSquare size={16} className="text-yellow-400" />{" "}
                        {article?.blogStatus?.comments}
                      </td>
                      <td className="p-4 flex items-center gap-2 text-slate-100">
                        <Eye size={16} className="text-yellow-400" />{" "}
                        {article?.blogStatus?.views}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(article.slug)}
                            className="flex items-center px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="flex items-center px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {blogs.map((article) => (
                <div
                  key={article._id}
                  className="bg-white/10 p-4 rounded-lg shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-yellow-400">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    Category:{" "}
                    <span className="font-medium text-white">
                      {article.category}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-4 text-slate-200 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-yellow-400" />{" "}
                      {article?.blogStatus?.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} className="text-yellow-400" />{" "}
                      {article?.blogStatus?.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} className="text-yellow-400" />{" "}
                      {article?.blogStatus?.views}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(article.slug)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition text-sm"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center font-bold mt-12 text-white">
            <h2 className="bg-white/10 p-2 animate-pulse">
              Start sharing your ideas with the world
            </h2>
            <h3 className="bg-white/10 p-2 animate-pulse mt-2">
              Create Your First Blog
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
