import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useAuth } from "../context/authProvider";
import { baseUrl } from "./Signup";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, logout } = useAuth();

  const navItems = [
    { navItem: "Home", navPath: "/" },
    { navItem: "Blogs", navPath: "/blogs" },

    // Conditional dashboard link for authenticated users
    ...(auth
      ? [
          {
            navItem: "Dashboard",
            navPath: "/user-dashboard",
          },
        ]
      : []),

    // Avatar for authenticated users
    ...(auth
      ? [
          {
            navItem: (
              <Avatar
                src={`${baseUrl}${auth.avatar}`}
                alt={auth.userName}
                sx={{ width: 32, height: 32 }}
              />
            ),
            navPath: "/profile", // Link to user profile
            hideLabel: true, // Flag to hide in mobile menu
          },
        ]
      : []),

    // Auth-related items
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
          {
            navItem: "Signup",
            navPath: "/signup",
          },
        ]),
  ];
  return (
    <Wrapper>
      <nav>
        <div className="container">
          <Link to="/" className="logo">
            Blogs
          </Link>

          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            {navItems.map((item, i) => (
              <NavLink
                className={({ isActive }) =>
                  `navItem ${isActive ? "active" : ""}`
                }
                key={`nav-${i}`}
                to={item.navPath}
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
    padding: 0.5rem 1rem;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 1px 2px white;
  }

  .container {
    width: 86vw;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    color: #ff9800;
    font-size: 1.5rem;
    font-weight: bold;
    font-family: cursive;
    text-decoration: none;
  }

  .hamburger {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    display: none;
    padding: 0.5rem;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .navItem {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    position: relative;

    &:hover {
      color: #ff9800;
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
      width: 100%;
      background: #000;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      display: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 999;
    }

    .nav-links.open {
      display: flex;
    }

    .navItem {
      padding: 0.5rem 1rem;
      width: 100%;
      text-align: center;
      justify-content: center;

      &.active::after {
        width: 50%;
        left: 25%;
      }
    }
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.span`
  font-size: 0.9rem;
`;

export default Navbar;
