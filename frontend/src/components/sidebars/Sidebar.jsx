// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SmartSidebar({ isOpen, onClose, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const moreDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Use provided user data or fallback to default
  const userProfile = user || {
    fullName: "Dr. Birekassa Alemayehu",
    role: "Student Dean",
    email: "birekassa@mtu.edu.et",
    avatar: "👨‍🏫",
    department: "Student Affairs",
    campus: "Main Campus"
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar when route changes (mobile only) - FIXED
  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]); // Added isOpen to dependencies

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Role-based navigation links for Dean
  const deanNavLinks = [
    { 
      path: "/", 
      label: "Dashboard", 
      icon: "📊",
      description: "Overview & Analytics"
    },
    { 
      path: "/students", 
      label: "Students", 
      icon: "👨‍🎓",
      description: "Manage Student Records",
      badge: "2,456"
    },
    { 
      path: "/verify", 
      label: "Verify Student", 
      icon: "✅",
      description: "Quick Verification"
    },
    { 
      path: "/daily-status", 
      label: "Meal Analytics", 
      icon: "📈",
      description: "Daily Reports & Stats"
    },
  ];

  const managementLinks = [
    { 
      path: "/register", 
      label: "Register Student", 
      icon: "📝",
      description: "New Student Registration"
    },
    { 
      path: "/deny-management", 
      label: "Access Control", 
      icon: "🚫",
      description: "Manage Meal Restrictions"
    },
    { 
      path: "/settings", 
      label: "System Settings", 
      icon: "⚙️",
      description: "Configuration & Preferences"
    },
  ];

  const profileActions = [
    { label: "My Profile", icon: "👤", action: () => navigate("/profile") },
    { label: "Account Settings", icon: "⚙️", action: () => navigate("/settings") },
    { label: "Notifications", icon: "🔔", action: () => navigate("/notifications") },
    { 
      label: "Logout", 
      icon: "🚪", 
      action: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        navigate("/login");
      }
    },
  ];

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Smart Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          h-screen flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          backdrop-blur-xl
        `}
      >
        {/* Header with Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div
              className="flex items-center space-x-3 cursor-pointer group flex-1"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-all duration-300 shadow-lg">
                  🍽️
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  MTU MealCard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dean Portal</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
            </button>
          </div>

          {/* User Profile Preview */}
          <div 
            className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userProfile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {userProfile.fullName}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {userProfile.role}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userProfile.department}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          className="lg:hidden absolute top-6 right-6 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 z-10"
          onClick={onClose}
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Main Navigation for Dean */}
          <div className="mb-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dean Dashboard
            </div>
            <div className="space-y-1">
              {deanNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isActiveLink(link.path)
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg transition-transform group-hover:scale-110 ${
                      isActiveLink(link.path) ? "text-blue-600 dark:text-blue-400" : ""
                    }`}>
                      {link.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{link.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{link.description}</div>
                    </div>
                  </div>
                  
                  {/* Badge */}
                  {link.badge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isActiveLink(link.path)
                        ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Management Section */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Management
            </div>
            <div className="space-y-1">
              {managementLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                    isActiveLink(link.path)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{link.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{link.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Enhanced User Profile Section */}
        <div ref={profileDropdownRef} className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Profile Header */}
          <div 
            className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {userProfile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {userProfile.fullName}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {userProfile.role}
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userProfile.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userProfile.fullName}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {userProfile.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile.department}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>📧 {userProfile.email}</p>
                  <p>🏛️ {userProfile.campus}</p>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="p-2 space-y-1">
                {profileActions.map((action, index) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-left"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="font-medium text-sm">{action.label}</span>
                  </button>
                ))}
                
                {/* Theme Toggle in Dropdown */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-left"
                >
                  <span className="text-lg">{isDarkMode ? "☀️" : "🌙"}</span>
                  <span className="font-medium text-sm">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}