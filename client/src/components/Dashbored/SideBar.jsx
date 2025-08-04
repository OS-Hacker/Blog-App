import React, { useState, useEffect } from "react";
import { Home, User, FileText, BarChart2, Bell, Settings } from "lucide-react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthProvider";
import { baseUrl } from "../../pages/Signup";
import { NavLink } from "react-router-dom";

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState("Overview");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { icon: <Home size={20} />, label: "Overview", path: "/user-dashboard" },
    {
      icon: <User size={20} />,
      label: "Articles",
      path: "/create-articles",
    },
    { icon: <FileText size={20} />, label: "Comments", path: "/comments-page" },
    { icon: <BarChart2 size={20} />, label: "Analytics", path: "/analytics" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  const { auth } = useAuth();

  return (
    <SideBarContainer $collapsed={collapsed}>
      <SidebarContent>
        <div>
          {navItems.map((item) => (
            <StyledNavLink
              key={item.label}
              $active={activeItem === item.label}
              onClick={() => {
                setActiveItem(item.label);
                if (isMobile) setCollapsed(true);
              }}
              to={item.path}
            >
              {item.icon}
              <NavText $collapsed={collapsed}>{item.label}</NavText>
            </StyledNavLink>
          ))}
        </div>

        <UserSection $collapsed={collapsed}>
          <Avatar
            src={`${auth?.avatar.url}`}
            alt={auth?.userName}
            $collapsed={collapsed}
          />
          <UserInfo $collapsed={collapsed}>
            <p>{auth?.userName}</p>
            <p>{auth?.role}</p>
          </UserInfo>
        </UserSection>
      </SidebarContent>
    </SideBarContainer>
  );
};

export default SideBar;

const SideBarContainer = styled.div`
  height: 90vh;
  position: relative;
  top: 70px;
  color: white;
  transition: width 0.3s ease;
  width: ${({ $collapsed }) => ($collapsed ? "80px" : "250px")};
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background-color: transparent;

  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  ${({ $active }) =>
    $active &&
    `
    background: rgba(255, 255, 255, 0.15);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 3px;
      background: #ff9800;
      border-radius: 0 3px 3px 0;
    }
  `}
`;

const NavText = styled.span`
  margin-left: 1rem;
  background-color: none !important;
  display: ${({ $collapsed }) => ($collapsed ? "none" : "block")};
`;

const UserSection = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "flex-start"};
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  ${({ $collapsed }) => $collapsed && "margin: 0 auto;"}
`;

const UserInfo = styled.div`
  margin-left: 1rem;
  display: ${({ $collapsed }) => ($collapsed ? "none" : "block")};

  p:first-child {
    font-weight: 500;
  }

  p:last-child {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;
