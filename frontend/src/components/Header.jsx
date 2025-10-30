import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/students", label: "Students", icon: "👨‍🎓" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/contact", label: "Contact", icon: "📞" },
  ];

  const moreLinks = [
    { path: "/verify", label: "Verify", icon: "✅" },
    { path: "/deny", label: "Deny", icon: "🚫" },
    { path: "/daily-status", label: "Analysis", icon: "📊" },
    { path: "/register", label: "Register", icon: "📝" },
  ];

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`glass-effect sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "shadow-2xl bg-gray-900/95 backdrop-blur-xl py-2" 
          : "shadow-lg bg-gray-900/80 backdrop-blur-lg py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-all duration-300 shadow-lg pulse-glow">
                🍽️
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient-text">
                MTU MealCard
              </h1>
              <p className="text-xs text-gray-400 font-medium">Smart Dining System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                  isActiveLink(link.path)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md"
                }`}
              >
                <span className="text-lg transition-transform group-hover:scale-110">
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
                
                {/* Active indicator */}
                {isActiveLink(link.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            <div
              ref={moreDropdownRef}
              className="relative"
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isMoreOpen || isActiveLink("/more")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md"
                }`}
              >
                <span className="text-lg transition-transform group-hover:scale-110">⋯</span>
                <span className="font-medium">More</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isMoreOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ${
                  isMoreOpen
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2">
                  {moreLinks.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 text-gray-200 transition-all duration-300 hover:transform hover:translate-x-2 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-lg transition-transform group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* User Actions & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {/* User profile/actions can be added here */}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 group relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div
                  className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-white transition-all duration-300 my-1 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen
              ? "max-h-96 opacity-100 pb-4 mt-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                  isActiveLink(link.path)
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium text-lg">{link.label}</span>
              </Link>
            ))}

            {/* More Links in Mobile */}
            <div className="border-t border-gray-700/50 pt-4 mt-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                More Options
              </div>
              {moreLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-4 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}