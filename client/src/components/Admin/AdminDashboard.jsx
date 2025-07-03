import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaBookOpen } from "react-icons/fa";
import styled from "styled-components";
import { useAuth } from "../../context/authProvider";

const AdminDashboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const goToCreate = () => {
    navigate("/create-blog");
  };

  const showRead = () => {
    navigate("/read-blog");
  };

  // default dashboard view
  return (
    <Wrapper>
      <Header>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {auth?.userName}</p>
      </Header>
      <Actions>
        <Card onClick={goToCreate}>
          <IconWrapper>
            <FaPlusCircle size={48} />
          </IconWrapper>
          <CardTitle>Create Blog</CardTitle>
        </Card>

        <Card onClick={showRead}>
          <IconWrapper>
            <FaBookOpen size={48} />
          </IconWrapper>
          <CardTitle>Read Blogs</CardTitle>
        </Card>
      </Actions>
    </Wrapper>
  );
};

export default AdminDashboard;

/** Styled Components **/
const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  padding: 2rem;
  margin-top: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #666;
  }

  button {
    margin-top: 1rem;
    background: none;
    border: none;
    color: #1890ff;
    font-size: 0.9rem;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  gap: 1.5rem;
  flex-grow: 1;
  align-items: start;
`;

const Card = styled.div`
  border-radius: 1rem;
  padding: 2rem 0rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  color: #ff9800;
  margin-bottom: 0.75rem;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  color: #333;
  margin: 0;
`;

  /* additional styling for your ReadBlogs list */

