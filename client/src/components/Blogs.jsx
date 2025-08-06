import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
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
  // State for storing blog posts data
  const [blogs, setBlogs] = useState([]);

  // Loading state for API calls
  const [loading, setLoading] = useState(false);

  // Authentication context
  const { auth } = useAuth();

  /**
   * Fetches blogs from the API
   */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/blogs`);
      setBlogs(res?.data.blog);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]); // Add all dependencies here

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]); // Now depends on the memoized function

  // Navigation hook for routing
  const Navigate = useNavigate();

  // Like functionality state
  // Structure: { [blogId]: { likedByUser: boolean, likesCount: number } }
  const [likedBlogs, setLikedBlogs] = useState({});

  /**
   * Handles liking/unliking a blog
   * @param {string} blogId - ID of the blog to like/unlike
   */
  const likeBlog = async (blogId) => {
    if (!auth) {
      toast("Please Login", {
        position: "top-center",
      });
    }
    try {
      const res = await axios.post(`${baseUrl}/blog/like/${blogId}`);
      const { likedByUser, likesCount } = res.data;

      // Update liked state for this specific blog
      setLikedBlogs((prev) => ({
        ...prev,
        [blogId]: { likedByUser, likesCount },
      }));
    } catch (error) {
      console.log(error);
    }
  };

  // Get current user ID from auth context
  const currentUserId = auth?._id;

  // Main render
  return (
    <BlogsContainer>
      <CardGrid>
        {/* Loading state */}
        {loading ? (
          <Loading />
        ) : /* Render blogs if available */
        blogs.length > 0 ? (
          blogs.map((blog) => {
            // Destructure blog properties
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

            console.log(baseUrl);

            // Get like data from state or fallback to blog defaults
            const likeData = likedBlogs[_id] || {};
            const isLiked = likeData.hasOwnProperty("likedByUser")
              ? likeData.likedByUser
              : blog.likes.includes(currentUserId);

            // Get total likes count from state or fallback to blog defaults
            const totalLikes = likeData.likesCount ?? blog.blogStatus.likes;

            return (
              <CardContainer
                key={_id}
                onClick={() => Navigate(`/single-blog/${slug}`)}
              >
                {/* Blog cover image */}
                <ImageContainer>
                  <img src={`${coverImage.url}`} alt={title} />
                </ImageContainer>

                {/* Blog content */}
                <ContentContainer>
                  <SubContainer>
                    {/* Blog category tag */}
                    <CategoryTag category={category}>{category}</CategoryTag>

                    {/* View and Like counters */}
                    <IconContainer onClick={(e) => e.stopPropagation()}>
                      {/* View counter */}
                      <ViewCount>
                        <FaEye />
                        <span>{blog.blogStatus.views}</span>
                      </ViewCount>

                      {/* Like button with icon that changes based on like state */}
                      <LikeIconButton
                        $isLiked={isLiked}
                        onClick={(e) => {
                          e.stopPropagation();
                          likeBlog(_id);
                        }}
                      >
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{totalLikes}</span>
                      </LikeIconButton>
                    </IconContainer>
                  </SubContainer>
                  {/* Blog title */}
                  <Title>{title}</Title>
                  {/* Blog excerpt (first 100 chars) */}
                  <Excerpt>
                    {content.replace(/<[^>]*>?/gm, " ").substring(0, 100)}...
                  </Excerpt>
                  {/* Author info and publish date */}
                  <AvatarContainer>
                    <AvatarWrapper>
                      {/* Author avatar */}
                      <AvatarImage
                        src={
                          author?.avatar
                            ? `${author.avatar.url}`
                            : "/default-avatar.png"
                        }
                        alt={author?.userName || "Anonymous"}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      {/* Author name */}
                      <UserName>{author?.userName || "Unknown User"}</UserName>
                    </AvatarWrapper>
                    {/* Publish date */}
                    <CreatedDate>{formatCreatedAt(createdAt)}</CreatedDate>
                  </AvatarContainer>
                </ContentContainer>
              </CardContainer>
            );
          })
        ) : (
          /* No blogs found message */
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "70vh",
              color: "white",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            Blog Not Found
          </p>
        )}
      </CardGrid>
    </BlogsContainer>
  );
};

export default Blogs;

/*************************
 * STYLED COMPONENTS
 *************************/

// Container for the blog cards grid

const BlogsContainer = styled.div`
  min-height: 100vh; /* ensures full viewport height */
  background-color: black;
  padding: 2rem 0; /* add some vertical spacing */
`;

const CardGrid = styled.div`
  width: 80vw;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 20px auto;
  padding: 4rem 0;
`;

// Container for author avatar and info
const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px #ff9800;
`;

// Wrapper for avatar and username
const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Author avatar image
const AvatarImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff9800;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Author username text
const UserName = styled.span`
  font-weight: 600;
  color: gray;
  font-size: 0.9rem;

  &:hover {
    color: #ff9800;
    cursor: pointer;
    text-decoration: underline;
  }
`;

// Blog creation date
const CreatedDate = styled.span`
  font-size: 0.8rem;
  color: gray;
  white-space: nowrap;
`;

// Individual blog card container
const CardContainer = styled.article`
  width: 100%;
  margin: 20px 0px;
  max-width: 300px;
  border-radius: 12px;
  /* background: white; */
  box-shadow: 0 2px 4px #ff9800;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px #ff9800;
  }
`;

// Container for blog cover image
const ImageContainer = styled.div`
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;

    ${CardContainer}:hover & {
      transform: scale(1.05);
    }
  }
`;

// Container for blog content (below image)
const ContentContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

// Container for category tag and icons
const SubContainer = styled.span`
  display: flex;
  justify-content: space-between;
`;

// Blog title
const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #faf4e8;
  margin: 0;
  line-height: 1.3;
`;

// Category tag/chip
const CategoryTag = styled.span`
  display: inline-block;
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  background-color: ${({ category }) => {
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
        return "#a0aec0"; // gray for unknown categories
    }
  }};
`;

// Blog content excerpt
const Excerpt = styled.p`
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
  /* display: -webkit-box;
  -webkit-line-clamp: 3; */
  /* -webkit-box-orient: vertical; */
  overflow: hidden;
`;

// Container for view/like icons
const IconContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
  padding: 0 16px 16px;
`;

// View count component
export const ViewCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;

  svg {
    color: #888;
    font-size: 14px;
  }
`;

// Like button with animation
export const LikeIconButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => (props.$isLiked ? "#ff0000" : "#666")};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    transition: all 0.3s ease;
  }

  &.liked {
    animation: pulse 0.3s ease;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;
