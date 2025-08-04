import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { baseUrl } from "./Signup";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, logout } = useAuth();

  const navItems = [
    { navItem: "Home", navPath: "/" },
    { navItem: "Blogs", navPath: "/blogs" },
    ...(auth ? [{ navItem: "Dashboard", navPath: "/user-dashboard" }] : []),
    ...(auth
      ? [
          {
            navItem: (
              <Avatar
                src={`${baseUrl}${auth.avatar.url}`}
                alt={auth.userName}
              />
            ),
            navPath: "/profile",
            hideLabel: true,
          },
        ]
      : []),
    ...(auth
      ? [
          {
            navItem: "Logout",
            navPath: "#",
            onClick: logout,
          },
        ]
      : [
          { navItem: "Login", navPath: "/login" },
          { navItem: "Signup", navPath: "/signup" },
        ]),
  ];

  return (
    <Wrapper>
      <nav>
        <div className="container">
          <Link to="/" className="logo">
            Blogs
          </Link>

          <div
            className={`hamburger ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </div>

          <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            {navItems.map((item, i) => (
              <NavLink
                key={i}
                to={item.navPath}
                className={({ isActive }) =>
                  `navItem ${isActive ? "active" : ""}`
                }
                onClick={() => {
                  setIsMenuOpen(false);
                  if (item.onClick) item.onClick();
                }}
                end
              >
                {item.navItem}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  nav {
    background: #000;
    padding: 0.75rem 1rem;
    position: fixed;
    width: 100%;
    z-index: 1000;
    top: 0;
    box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .container {
    width: 90vw;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-family: cursive;
    font-size: 1.7rem;
    color: #ff9800;
    text-decoration: none;
    letter-spacing: 1px;
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  /* HAMBURGER ANIMATION */
  .hamburger {
    width: 25px;
    height: 22px;
    position: relative;
    display: none;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }

  .hamburger span {
    background: white;
    border-radius: 2px;
    position: absolute;
    width: 100%;
    height: 3px;
    transition: all 0.3s ease-in-out;
  }

  .hamburger span:nth-child(1) {
    top: 0;
  }
  .hamburger span:nth-child(2) {
    top: 10px;
  }
  .hamburger span:nth-child(3) {
    bottom: 0;
  }

  .hamburger.open span:nth-child(1) {
    transform: rotate(45deg);
    top: 10px;
  }

  .hamburger.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.open span:nth-child(3) {
    transform: rotate(-45deg);
    bottom: 10px;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
    transition: all 0.4s ease-in-out;
  }

  .navItem {
    font-size: 1rem;
    color: white;
    text-decoration: none;
    transition: color 0.3s, transform 0.3s;
    display: flex;
    align-items: center;

    &:hover {
      color: #ff9800;
      transform: scale(1.05);
    }

    &.active {
      color: #ff9800;
      font-weight: bold;
    }
  }

  @media (max-width: 768px) {
    .hamburger {
      display: block;
    }

    .nav-links {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: #000;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem 0;
      display: none;
      opacity: 0;
      transform: translateY(-20px);
      pointer-events: none;
      transition: all 0.4s ease-in-out;
    }

    .nav-links.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
      z-index: 999;
    }

    .navItem {
      width: 100%;
      justify-content: center;
    }
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff9800;
  transition: transform 0.3s ease, opacity 0.4s ease;
  &:hover {
    transform: scale(1.1);
    opacity: 0.85;
  }
`;

export default Navbar;
