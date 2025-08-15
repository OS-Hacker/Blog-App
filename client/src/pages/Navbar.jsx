import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, logout } = useAuth();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Blogs", path: "/blogs" },
    ...(auth ? [{ label: "Dashboard", path: "/user-dashboard" }] : []),
    ...(auth
      ? [
          {
            label: (
              <img
                src={auth.avatar?.url}
                alt={auth.userName}
                className="w-9 h-9 rounded-full object-cover border-2 border-orange-500 hover:scale-110 transition-transform duration-300"
              />
            ),
            path: "/profile",
            hideLabel: true,
          },
        ]
      : []),
    ...(auth
      ? [{ label: "Logout", path: "#", onClick: logout }]
      : [
          { label: "Login", path: "/login" },
          { label: "Signup", path: "/signup" },
        ]),
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-black shadow-lg z-50 border-b border-gray-800">
      <nav className="w-full flex justify-between items-center px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-2xl font-bold tracking-tight hover:scale-105 transition-transform duration-300"
        >
          <span className="text-orange-500">B</span>
          <span className="text-white">logs</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex justify-between items-center">
          {navItems.map((item, i) => (
            <li key={i}>
              <NavLink
                to={item.path}
                onClick={item.onClick}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm md:text-base font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? "text-orange-500"
                      : "text-gray-300 hover:text-orange-500"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-orange-500 focus:outline-none"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <div className="w-6 relative">
            <span
              className={`block absolute h-0.5 font-black w-7 bg-current transform transition duration-300 ease-in-out ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
              }`}
            />
            <span
              className={`block absolute h-0.5 w-7 bg-current transform transition duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block absolute h-0.5 w-7 bg-current transform transition duration-300 ease-in-out ${
                isMenuOpen ? "-rotate-45 translate-y-1.5" : "translate-y-1"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900 absolute w-full left-0 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-2">
          {navItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              onClick={() => {
                setIsMenuOpen(false);
                if (item.onClick) item.onClick();
              }}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-orange-500"
                    : "text-gray-300 hover:bg-orange-500"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
