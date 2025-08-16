import React, { useEffect, useState, useCallback } from "react";
import { FaUser, FaReply, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../pages/Signup";
import { useNavigate, useParams } from "react-router-dom";
import { formatCreatedAt } from "./formatCreatedAt";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-toastify";

const Comments = () => {
  const [inputText, setInputText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const { slug } = useParams();
  const { auth } = useAuth();
  const currentUser = auth?._id;

  const normalize = (arr = []) =>
    arr.map((item) => ({
      ...item,
      replies: normalize(item.replies || []),
    }));

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/comments/${slug}`);
      setComments(normalize(res.data.data || []));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const navigate = useNavigate();

  const handleAddComment = async () => {
    if (!auth) {
      navigate("/login");
      toast("Please Login", { position: "top-center" });
    }
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${baseUrl}/comment/add/${slug}`,
        { text: inputText },
        { withCredentials: true }
      );
      setComments((prev) => [res.data.data, ...prev]);
      setInputText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const addReplyToTree = (nodes, parentId, reply) => {
    return nodes.map((node) => {
      if (node._id === parentId) {
        return {
          ...node,
          replies: [...(node.replies || []), reply],
        };
      }
      if (node.replies?.length > 0) {
        return {
          ...node,
          replies: addReplyToTree(node.replies, parentId, reply),
        };
      }
      return node;
    });
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;
    if (!auth) {
      navigate("/login");
      toast("Please Login", { position: "top-center" });
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${baseUrl}/comment-reply/${parentId}`,
        { text: replyText },
        { withCredentials: true }
      );
      setComments((prev) => addReplyToTree(prev, parentId, res.data.data));
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recursive renderer
  const renderComment = (comment, depth = 0) => {
    const isCurrentUser = comment.author?._id === currentUser;
    return (
      <li
        key={comment._id}
        className="mb-6 pb-6 border-b border-gray-200"
        style={{ marginLeft: depth * 20 }}
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
            {comment.author?.avatar ? (
              <img
                src={comment.author.avatar.url}
                alt="user"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FaUser size={20 - depth * 2} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold  text-white ">
                {comment.author?.userName || "Anonymous"}
              </span>
              <span className="text-xs text-gray-500">
                {formatCreatedAt(comment.createdAt)}
              </span>
            </div>
            <p className="text-white  text-sm mb-2">{comment.text}</p>
            <div className="flex gap-4 text-gray-500 text-sm mt-2">
              <button className="flex items-center gap-1 hover:text-orange-500">
                <FaThumbsUp /> {comment.likes?.length || 0}
              </button>
              <button className="flex items-center gap-1 hover:text-orange-500">
                <FaThumbsDown /> {comment.dislikes?.length || 0}
              </button>
              {!isCurrentUser && (
                <button
                  onClick={() =>
                    setReplyingTo(
                      replyingTo === comment._id ? null : comment._id
                    )
                  }
                  className="flex items-center gap-1 hover:text-orange-500"
                >
                  <FaReply /> Reply
                </button>
              )}
            </div>

            {replyingTo === comment._id && (
              <div className="flex flex-col gap-2 mt-4 pt-2">
                <textarea
                  className="w-full border text-white  border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddReply(comment._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600"
                  >
                    {loading ? "Posting..." : "Reply"}
                  </button>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 bg-gray-200 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comment.replies?.length > 0 && (
              <ul className="pl-6 mt-4 border-l-2 border-gray-200">
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1)
                )}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="max-w-3xl mx-auto my-8 bg-black text-white p-4 rounded-lg">
      <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-4">
        Comments ({comments?.length})
      </h3>

      {/* Comment Form */}
      <div className="relative mb-6 flex gap-2">
        <textarea
          className="flex-1 p-3 border border-gray-300 rounded-md resize-none min-h-[80px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Add a comment..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={handleAddComment}
          disabled={loading}
          className="absolute right-2 bottom-2 px-4 py-1 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600"
        >
          {loading ? "Posting..." : "Comment"}
        </button>
      </div>

      {/* Comments List */}
      <ul className="list-none p-0 m-0">
        {comments.map((comment) => renderComment(comment))}
      </ul>
    </div>
  );
};

export default Comments;
