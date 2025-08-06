import React, { useEffect, useState } from "react";
import styled from "styled-components";
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

  // Sample data - replace with real data from your API
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
      // Confirm before deleting
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
    <DashboardContainer>
      <Header>
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your content.</p>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon>{stat.icon}</StatIcon>
            <StatContent>
              <h3>{stat.title}</h3>
              <StatValue>{stat.value || 0}</StatValue>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <TableContainer>
        {blogs.length > 0 ? (
          <Table>
            <thead>
              <TableRow header>
                <TableHeaderCell>Article Name</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Likes</TableHeaderCell>
                <TableHeaderCell>Comments</TableHeaderCell>
                <TableHeaderCell>Views</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </thead>
            <tbody>
              {blogs.map((article) => (
                <TableRow key={article._id}>
                  <TableCell>{article.title.substring(0, 50)}</TableCell>
                  <TableCell>
                    <CategoryTag category={article.category}>
                      {article.category}
                    </CategoryTag>
                  </TableCell>
                  <TableCell>
                    <StatWithIcon>
                      <Heart size={16} /> {article?.blogStatus?.likes}
                    </StatWithIcon>
                  </TableCell>
                  <TableCell>
                    <StatWithIcon>
                      <MessageSquare size={16} /> {article?.blogStatus.comments}
                    </StatWithIcon>
                  </TableCell>
                  <TableCell>
                    <StatWithIcon>
                      <Eye size={16} /> {article?.blogStatus.views}
                    </StatWithIcon>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <EditButton onClick={() => handleEdit(article.slug)}>
                        <Edit size={16} />
                      </EditButton>
                      <DeleteButton onClick={() => handleDelete(article._id)}>
                        <Trash2 size={16} />
                      </DeleteButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <DataNotAvilable>
            <h2>Start sharing your ideas with the world</h2>
            <h3>Create Your First Blog</h3>
          </DataNotAvilable>
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default UserDashboard;

const DashboardContainer = styled.div`
  min-height: 100vh; /* ensures full viewport height */
  padding: 2rem;
  max-width: 1400px;
  margin: 4rem auto 2rem;
  animation: fadeIn 0.6s ease-in-out;
  background-color: black;

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DataNotAvilable = styled.div`
  text-align: center;
  font-weight: 800;
  font-family: cursive;
  margin-top: 3rem;

  h2,
  h3 {
    padding: 0.5rem;
    background: rgba(207, 198, 198, 0.1);
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #1e293b;
  }

  p {
    color: #64748b;
    font-size: 1rem;
    margin-top: 0.25rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(207, 198, 198, 0.08);
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.06);
  }
`;

const StatIcon = styled.div`
  color: white;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  h3 {
    font-size: 0.9rem;
    color: #cbd5e1;
    margin-bottom: 0.2rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  color: #facc15;
`;

const TableContainer = styled.div`
  background: rgba(207, 198, 198, 0.08);
  border-radius: 0.75rem;
  padding: 1.5rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 768px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const TableRow = styled.tr`
  transition: background 0.2s ease;

  ${(props) =>
    props.header
      ? `background: rgba(207, 198, 198, 0.08);`
      : `&:hover {
        background: rgba(255, 255, 255, 0.04);
      }`}
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #fefce8;
  border-bottom: 1px solid #334155;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #f1f5f9;
  border-bottom: 1px solid #334155;
`;

const CategoryTag = styled.span`
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border-radius: 0.25rem;
  background-color: ${({ category }) => {
    switch (category) {
      case "technology":
        return "#3b82f6";
      case "travel":
        return "#10b981";
      case "food":
        return "#f97316";
      case "lifestyle":
        return "#8b5cf6";
      case "business":
        return "#ef4444";
      case "health":
        return "#14b8a6";
      case "education":
        return "#6366f1";
      default:
        return "#6b7280";
    }
  }};
`;

const StatWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg {
    stroke: #facc15;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const EditButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: #2563eb;
  }
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: #dc2626;
  }
`;
