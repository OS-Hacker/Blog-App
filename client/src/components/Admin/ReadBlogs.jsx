import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ReadBlogs = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Header>
        <h1>All Blogs</h1>
        <button onClick={() => navigate(-1)}>← Back</button>
      </Header>
      <ReadBlogs />
    </Wrapper>
  );
};

export default ReadBlogs;

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
