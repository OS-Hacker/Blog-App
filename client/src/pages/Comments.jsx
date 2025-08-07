import React from "react";
import styled from "styled-components";

const Comments = () => {
  return (
    <Wrapper>
      <Card>
        <h1>Comments Page</h1>
        <AlertBox>
          <p className="title">🚧 Work in progress</p>
          <p className="message">This page is currently under development.</p>
        </AlertBox>
      </Card>
    </Wrapper>
  );
};

export default Comments;

const Wrapper = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #000;
  padding: 1rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #fff;
  transition: transform 0.3s ease;

  h1 {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1.2rem;
    color: #ffeb3b;
  }

  &:hover {
    transform: scale(1.02);
  }
`;

const AlertBox = styled.div`
  background-color: #fff9c4;
  border-left: 5px solid #fbc02d;
  color: #333;
  padding: 1rem;
  border-radius: 8px;
  text-align: left;

  .title {
    font-weight: 600;
    font-size: 1rem;
    color: black;
  }

  .message {
    font-size: 0.9rem;
    margin-top: 0.4rem;
    color: black;
  }
`;
