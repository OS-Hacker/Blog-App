import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
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

  // Normalize replies to ensure structure
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

  // Recursive utility to add a reply at any depth
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

  // 🔁 Recursive Comment Renderer
  const renderComment = (comment, depth = 0) => {
    const isCurrentUser = comment.author?._id === currentUser;
    return (
      <CommentItem key={comment._id} style={{ marginLeft: depth * 20 }}>
        <CommentContent>
          <Avatar>
            {comment.author?.avatar ? (
              <AvatarImage
                src={comment.author.avatar.url}
                alt="user"
              />
            ) : (
              <FaUser size={20 - depth * 2} />
            )}
          </Avatar>
          <CommentBody>
            <CommentHeader>
              <AuthorName>{comment.author?.userName || "Anonymous"}</AuthorName>
              <CommentTime>{formatCreatedAt(comment.createdAt)}</CommentTime>
            </CommentHeader>
            <CommentText>{comment.text}</CommentText>
            <CommentActions>
              <ActionButton>
                <FaThumbsUp /> {comment.likes?.length || 0}
              </ActionButton>
              <ActionButton>
                <FaThumbsDown /> {comment.dislikes?.length || 0}
              </ActionButton>
              {!isCurrentUser && (
                <ActionButton
                  onClick={() =>
                    setReplyingTo(
                      replyingTo === comment._id ? null : comment._id
                    )
                  }
                >
                  <FaReply /> Reply
                </ActionButton>
              )}
            </CommentActions>
            {replyingTo === comment._id && (
              <ReplyForm>
                <CommentInput
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={loading}
                />
                <div>
                  <ReplayButton
                    onClick={() => handleAddReply(comment._id)}
                    disabled={loading}
                    style={{ marginRight: "10px" }}
                  >
                    {loading ? "Posting..." : "Reply"}
                  </ReplayButton>
                  <CancelButton onClick={() => setReplyingTo(null)}>
                    Cancel
                  </CancelButton>
                </div>
              </ReplyForm>
            )}

            {/* Fetched Nested Comment */}
            {comment.replies?.length > 0 && (
              <RepliesList>
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1)
                )}
              </RepliesList>
            )}
          </CommentBody>
        </CommentContent>
      </CommentItem>
    );
  };

  return (
    <CommentsContainer>
      <CommentsHeader>Comments ({comments?.length})</CommentsHeader>
      <CommentForm>
        <CommentInput
          placeholder="Add a comment..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <CommentButton onClick={handleAddComment} disabled={loading}>
          {loading ? "Posting..." : "Comment"}
        </CommentButton>
      </CommentForm>
      <CommentsList>
        {comments.map((comment) => renderComment(comment))}
      </CommentsList>
    </CommentsContainer>
  );
};

export default Comments;

// Styled Components
const CommentsContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  background-color: black;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const CommentsHeader = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;

`;

const CommentForm = styled.div`
  display: flex;
  gap: 0.5rem;
  position: relative;
  margin-bottom: 1rem;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: none;
  min-height: 80px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const CommentButton = styled.button`
  padding: 0.3rem 1rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  right: 0px;
  bottom: -53px;
  margin: 10px;
  font-weight: 500;
  align-self: flex-start;
  transition: background-color 0.2s;
  position: absolute;

  &:hover {
    background-color: #ff9800;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    bottom: -43px;
  }
`;

const ReplayButton = styled.button`
  padding: 0.3rem 1rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  /* margin: 10px; */
  font-weight: 500;
  align-self: flex-start;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff9800;
  }
`;

const CommentsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CommentItem = styled.li`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #edf2f7;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentContent = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: 768px) {
    margin-top: 30px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const CommentBody = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const CommentTime = styled.span`
  font-size: 0.8rem;
  color: #718096;
`;

const CommentText = styled.p`
  margin: 0.5rem 0;
  color: #4a5568;
  line-height: 1.5;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: #718096;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #27231e;
    color: #ff9800;
  }
`;

const RepliesList = styled.ul`
  list-style: none;
  padding-left: 2rem;
  margin-top: 1rem;
  border-left: 2px solid #e2e8f0;
`;

const ReplyForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.3rem 1rem;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  align-self: flex-start;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cbd5e0;
  }
`;
