import styled, { keyframes } from "styled-components";
import blogImage from "/images/blog.webp";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { auth, login } = useAuth();

  const Navigate = useNavigate();

  const handleStart = () => {
    return auth ? Navigate("/user-dashboard") : Navigate("/login");
  };

  return (
    <Wrapper>
      <div className="overlay">
        <div className="container">
          <h1>Welcome to My Digital Space</h1>
          <h3>Thoughts, Stories & Ideas</h3>
          <p>
            Explore tech blogs, life experiences, and daily musings curated with
            passion and purpose.
          </p>
          <button onClick={handleStart}>Get Started</button>
        </div>
      </div>
    </Wrapper>
  );
};

export default Home;

// Animations
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const bgZoom = keyframes`
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url(${blogImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  animation: ${bgZoom} 20s ease-in-out infinite alternate;
  .overlay {
    position: fixed; /* or absolute if inside a positioned container */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(
      10,
      10,
      10,
      0.5
    ); /* More transparent (0.5 opacity) */
    backdrop-filter: blur(12px); /* Slightly stronger blur */
    -webkit-backdrop-filter: blur(12px); /* For Safari support */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    z-index: 1000; /* Ensure it's above other content */
    border: none;
    margin: 0;
  }

  .container {
    text-align: center;
    color: #fff;
    padding: 2rem;
    max-width: 700px;
    width: 80%;
    animation: ${fadeIn} 1.5s ease forwards;

    h1 {
      font-size: clamp(2rem, 6vw, 3.5rem);
      font-weight: bold;
      font-family: "Georgia", serif;
      margin-bottom: 1rem;
      animation: ${fadeIn} 1s ease forwards;
    }

    h3 {
      font-size: clamp(1.3rem, 4vw, 2rem);
      font-style: italic;
      font-weight: 400;
      margin-bottom: 1rem;
      color: #ffd54f;
      animation: ${fadeIn} 1.2s ease forwards;
    }

    p {
      font-size: clamp(1rem, 2.5vw, 1.2rem);
      margin-bottom: 2rem;
      line-height: 1.6;
      color: #e0e0e0;
      animation: ${fadeIn} 1.4s ease forwards;
    }

    button {
      padding: 0.8rem 2.5rem;
      background: linear-gradient(135deg, #ff9800, #ffc107);
      color: #000;
      border: none;
      border-radius: 30px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 0 15px rgba(255, 152, 0, 0.6);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #ffa726, #ffca28);
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(255, 193, 7, 0.8);
      }
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
      max-width: 100%;
    }
  }
`;
