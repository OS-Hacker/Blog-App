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
                    <ActionButtons onClick={() => handleEdit(article.slug)}>
                      <EditButton>
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

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin-top: 2.3rem;
`;

const DataNotAvilable = styled.div`
  text-align: center;
  font-weight: 800;
  font-family: cursive;
  h2 {
    background: rgba(207, 198, 198, 0.1) !important;
  }
  h3 {
    background: rgba(207, 198, 198, 0.1) !important;
  }
`;

const Header = styled.div`
  margin-bottom: 1rem;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    /* margin-bottom: 0.5rem; */
  }

  p {
    color: #64748b;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(207, 198, 198, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
`;

const StatContent = styled.div`
  h3 {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    background: rgba(207, 198, 198, 0.1) !important;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  background: rgba(207, 198, 198, 0.1) !important;
  text-align: center;
`;

const TableContainer = styled.div`
  background: rgba(207, 198, 198, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
  height: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableRow = styled.tr`
  ${(props) =>
    props.header
      ? `
    background: rgba(207, 198, 198, 0.1);
  `
      : `
    &:hover {
      background: rgba(207, 198, 198, 0.1);
    }
  `}
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CategoryTag = styled.span`
  color: #1e293b;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
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

const StatWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EditButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #2563eb;
  }
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #dc2626;
  }
`;
