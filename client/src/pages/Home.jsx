import styled, { keyframes } from "styled-components";
import blogImage from "/images/blog.webp";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { auth, login } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(auth ? "/user-dashboard" : "/login");
  };

  return (
    <Wrapper>
      <Overlay>
        <ContentContainer>
          <Title>Welcome to My Digital Space</Title>
          <Subtitle>Thoughts, Stories & Ideas</Subtitle>
          <Description>
            Explore tech blogs, life experiences, and daily musings curated with
            passion and purpose.
          </Description>
          <StartButton onClick={handleStart}>Get Started</StartButton>
        </ContentContainer>
      </Overlay>
    </Wrapper>
  );
};

export default Home;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bgZoom = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.05); }
`;

// Styled Components
const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${blogImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* Optional: creates parallax effect */
  animation: ${bgZoom} 20s ease-in-out infinite alternate;

  /* Fallback for mobile browsers */
  @supports not (height: 100dvh) {
    height: 100vh;
    width: 100vw;
  }

  /* Preferred modern approach */
  @supports (height: 100dvh) {
    height: 100dvh;
    width: 100dvw;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 1000;
`;

const ContentContainer = styled.div`
  text-align: center;
  border-radius: 10px;
  color: #fff;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  background-color: black;

  animation: ${fadeIn} 1.5s ease forwards;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: bold;
  font-family: "Georgia", serif;
  margin-bottom: 1rem;
  animation: ${fadeIn} 1s ease forwards;
`;

const Subtitle = styled.h3`
  font-size: clamp(1.3rem, 4vw, 2rem);
  font-style: italic;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #ffd54f;
  animation: ${fadeIn} 1.2s ease forwards;
`;

const Description = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #e0e0e0;
  animation: ${fadeIn} 1.4s ease forwards;
`;

const StartButton = styled.button`
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
`;
