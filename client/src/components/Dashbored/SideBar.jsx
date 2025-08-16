import React, { useState, useEffect } from "react";
import { Home, User, FileText, BarChart2, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
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
    { icon: <User size={20} />, label: "Articles", path: "/create-articles" },
    { icon: <FileText size={20} />, label: "Comments", path: "/comments-page" },
    { icon: <BarChart2 size={20} />, label: "Analytics", path: "/analytics" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  const { auth } = useAuth();

  return (
    <div
      className={`bg-black text-white transition-all duration-300 h-[90vh] fixed top-[70px] 
        ${collapsed ? "w-[80px]" : "w-[250px]"}`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Nav Links */}
        <div>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => {
                setActiveItem(item.label);
                if (isMobile) setCollapsed(true);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 mb-2 rounded-lg transition-all relative
                 ${
                   activeItem === item.label || isActive
                     ? "bg-white/15 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r before:bg-orange-500"
                     : "hover:bg-white/10"
                 }`
              }
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* User Section */}
        <div
          className={`mt-auto pt-4 border-t border-white/10 flex items-center ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <img
            src={auth?.avatar?.url}
            alt={auth?.userName}
            className={`w-10 h-10 rounded-full object-cover ${
              collapsed ? "mx-auto" : ""
            }`}
          />
          {!collapsed && (
            <div className="ml-3">
              <p className="font-medium">{auth?.userName}</p>
              <p className="text-xs opacity-80">{auth?.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
