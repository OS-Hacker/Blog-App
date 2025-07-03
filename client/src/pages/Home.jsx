import styled from "styled-components";
import blogImage from "/images/blog.webp";
import { useAuth } from "../context/authProvider";

const Home = () => {
  const { auth, login } = useAuth();

  console.log(auth);

  return (
    <Wrapper>
      <div className="container">
        <h1>Welcome to My Digital Space</h1>
        <h3>Thoughts, Stories & Ideas</h3>
        <h1></h1>
      </div>
    </Wrapper>
  );
};

export default Home;

const Wrapper = styled.div`
  h1 {
    font-size: 2rem;
    padding: 10px;
    margin-bottom: 1rem;
    border-radius: 20px;
    font-family: cursive;
    color: #ff9800;
    font-weight: bold;
  }

  h3 {
    font-size: 2rem;
    padding: 10px;
    margin-bottom: 1rem;
    border-radius: 20px;
    font-family: cursive;
    color: #ff9800;
    font-weight: bold;
  }

  p {
    font-size: 1.2rem;
  }
  .container {
    /* margin-top: 60px; */
    /* text-align: center; */
    height: 100vh;
    background-image: url(${blogImage}); /* <- path to your image */
    background-size: cover;
    background-position: center;
    margin: auto;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
  }
`;
