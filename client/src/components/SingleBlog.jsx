import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Loading from "../pages/Loading";
import { baseUrl } from "../pages/Signup";
import Comments from "./Comments";

const SingleBlog = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/single-blog/${slug}`);
      setBlog(res.data);

      // Increment view count
      await axios.patch(`${baseUrl}/${slug}/view`);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  if (loading) return <Loading />;
  if (!blog) return <NotFound>Blog not found</NotFound>;

  const formatCreatedAt = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  console.log(blog);

  return (
    <BlogContainer>
      <BlogHeader>
        <CategoryTag category={blog.category}>{blog?.category}</CategoryTag>
        <BlogTitle>{blog.title}</BlogTitle>
        <BlogExcerpt>
          {blog.excerpt || "A fascinating read about " + blog.category}
        </BlogExcerpt>

        <AuthorContainer>
          <AvatarImage
            src={
              blog?.author?.avatar
                ? `${baseUrl}${blog.author.avatar}`
                : "/default-avatar.png"
            }
            alt={blog?.author?.userName || "Anonymous"}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <AuthorInfo>
            <AuthorName>
              {blog?.author?.userName || "Unknown Author"}
            </AuthorName>
            <PublishDate>
              {formatCreatedAt(blog?.createdAt)} ·{" "}
              {Math.ceil(blog?.content?.length / 1500) || 5} min read
            </PublishDate>
          </AuthorInfo>
        </AuthorContainer>
      </BlogHeader>
      <FeaturedImageContainer>
        <FeaturedImage
          src={`${baseUrl}${blog?.coverImage}`}
          alt={blog?.title}
          loading="lazy"
        />
        {blog?.imageCaption && <ImageCaption>{blog.imageCaption}</ImageCaption>}
      </FeaturedImageContainer>
      <BlogContent dangerouslySetInnerHTML={{ __html: blog?.content }} />
      <Divider />
      <Comments />
    </BlogContainer>
  );
};

export default SingleBlog;
const BlogContainer = styled.article`
  max-width: 740px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  color: #2d3748;
  margin-top: 5rem;

  @media (max-width: 768px) {
    padding: 0 1rem 3rem;
    margin-top: 3rem;
  }
`;

const BlogHeader = styled.header`
  margin: 3rem 0 2.5rem;
  text-align: center;

  @media (max-width: 480px) {
    margin: 2rem 0 1.5rem;
  }
`;

const BlogTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 2.75rem);
  margin: 1rem 0 1.5rem;
  line-height: 1.2;
  font-weight: 800;
  color: #30343d;
  letter-spacing: -0.025em;
  @media (max-width: 768px) {
    font-size: 25px;
  }
`;

const BlogExcerpt = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.5;
  font-weight: 400;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
  border: 2px solid #f7fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 480px) {
    margin: 0 0 0.75rem;
  }
`;

const AuthorInfo = styled.div`
  text-align: left;

  @media (max-width: 480px) {
    text-align: center;
  }
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const PublishDate = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
`;

const CategoryTag = styled.span`
  display: inline-block;
  color: white;
  margin-top:22px;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  background-color: ${({ category }) => {
    switch (category) {
      case "technology":
        return "#4299e1";
      case "travel":
        return "#48bb78";
      case "food":
        return "#ed8936";
      case "lifestyle":
        return "#9f7aea";
      case "business":
        return "#f56565";
      case "health":
        return "#38b2ac";
      case "education":
        return "#667eea";
      default:
        return "#a0aec0";
    }
  }};
`;

const FeaturedImageContainer = styled.div`
  margin: 2.5rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 480px;

  @media (max-width: 480px) {
    max-height: 280px;
  }
`;

const ImageCaption = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.75rem;
  font-style: italic;
`;

const BlogContent = styled.div`
  line-height: 1.8;
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #4a5568;

  p {
    margin-bottom: 1.75rem;
  }

  h2 {
    font-size: clamp(1.5rem, 3vw, 1.75rem);
    margin: 3rem 0 1.5rem;
    color: #1a202c;
    font-weight: 700;
    line-height: 1.3;
  }

  h3 {
    font-size: clamp(1.3rem, 2.5vw, 1.5rem);
    margin: 2.5rem 0 1.25rem;
    color: #2d3748;
    font-weight: 600;
    line-height: 1.3;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem 0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  a {
    color: #3182ce;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
      color: #2c5282;
    }
  }

  blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1.5rem;
    margin: 2rem 0;
    color: #4a5568;
    font-style: italic;
  }

  ul,
  ol {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.75rem;
  }

  code {
    background-color: #edf2f7;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.95em;
  }

  pre {
    background-color: #2d3748;
    color: #f7fafc;
    padding: 1.5rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 2rem 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e2e8f0;
  margin: 3rem 0;
`;

const NotFound = styled.div`
  text-align: center;
  padding: 6rem 0;
  font-size: 1.5rem;
  color: #718096;

  @media (max-width: 480px) {
    padding: 4rem 0;
    font-size: 1.25rem;
  }
`;
