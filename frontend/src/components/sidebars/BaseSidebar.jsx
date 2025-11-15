// frontend/src/components/sidebars/BaseSidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const BaseSidebar = ({ 
  isOpen, 
  onClose, 
  onLogout, 
  roleConfig,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse 
}) => {
  const location = useLocation();
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const dropdownRef = useRef(null);

  // Use external state if provided, otherwise use internal state
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    } else {
      setInternalIsCollapsed(!isCollapsed);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileDropdown = () => {
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      if (onClose) onClose();
      setIsMobileDropdownOpen(false);
    }
  };

  const {
    menuCategories,
    styleConfig
  } = roleConfig;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}

      {/* Mobile Header with Three-Dot Dropdown */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 text-white p-4 shadow-lg border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${styleConfig.accentGradient} shadow-lg animate-pulse`}>
              <span className="text-lg">{styleConfig.logoIcon}</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {styleConfig.title}
              </h1>
              <p className="text-purple-200 text-xs font-medium">
                {styleConfig.subtitle}
              </p>
            </div>
          </div>
          
          {/* Three-Dot Mobile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleMobileDropdown}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 12h.01M12 12h.01M19 12h.01" 
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMobileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-white/10 backdrop-blur-sm animate-fadeIn">
                <div className="p-2 max-h-96 overflow-y-auto">
                  {/* All Menu Items by Category */}
                  {menuCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4">
                      {/* Category Header */}
                      <div className="flex items-center space-x-2 p-2 text-purple-300 border-l-2 border-purple-500 ml-2 mb-2">
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {category.name}
                        </span>
                      </div>
                      
                      {/* Category Items */}
                      {category.items.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleLinkClick}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                            isActive(item.path)
                              ? 'bg-white/20 text-white shadow-lg transform scale-105'
                              : 'text-gray-200 hover:bg-white/10 hover:text-white hover:transform hover:scale-105'
                          }`}
                        >
                          <span className="text-lg transform group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <span className="font-medium flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs rounded-full bg-pink-500 animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}

                  {/* Logout Button in Dropdown */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <span className="text-lg transform hover:scale-110 transition-transform">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Container - Static positioning that pushes content */}
      <div 
        className={`
          hidden lg:flex flex-col z-30
          ${isCollapsed ? 'w-16' : 'w-64'} 
          bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 
          text-white 
          transition-all duration-300 ease-in-out 
          shadow-2xl border-r border-white/10
          backdrop-blur-sm bg-opacity-90
          flex-shrink-0
          h-screen
          sticky top-0
        `}
        style={{ 
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start'
        }}
      >
        
        {/* Header Section - Desktop */}
        <div className={`
          flex items-center justify-between p-4 
          border-b border-white/20 
          ${isCollapsed ? 'flex-col space-y-2' : ''}
          flex-shrink-0
          h-16
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${styleConfig.accentGradient}
              shadow-lg transform transition-transform hover:scale-110 animate-pulse
            `}>
              <span className="text-lg">{styleConfig.logoIcon}</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {styleConfig.title}
                </h1>
                <p className="text-purple-200 text-xs font-medium">
                  {styleConfig.subtitle}
                </p>
              </div>
            )}
          </div>
          
          {/* Collapse Button - Desktop */}
          <button 
            onClick={toggleCollapse}
            className={`
              p-1.5 rounded-lg transition-all duration-200
              hover:bg-white/10 active:scale-95 transform hover:scale-110
              ${isCollapsed ? 'rotate-180' : ''}
              flex-shrink-0
            `}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Render all menu categories */}
            {menuCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-2">
                {/* Category Header - Only show when not collapsed */}
                {!isCollapsed && (
                  <div className="flex items-center space-x-2 px-2 py-1 text-purple-300 border-l-2 border-purple-500">
                    <span className="text-sm">{category.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {category.name}
                    </span>
                  </div>
                )}
                
                {/* Category Items */}
                <div className="space-y-1">
                  {category.items.map(item => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      onClick={handleLinkClick}
                      onMouseEnter={() => setActiveHover(item.path)}
                      onMouseLeave={() => setActiveHover(null)}
                      className={`
                        flex items-center p-3 rounded-xl transition-all duration-200 group
                        ${isCollapsed ? 'justify-center' : 'space-x-3'}
                        ${isActive(item.path) 
                          ? `bg-white/20 shadow-lg ${styleConfig.accentShadow} text-white transform scale-105` 
                          : 'text-purple-100 hover:bg-white/10 hover:text-white hover:shadow-md hover:transform hover:scale-105'
                        }
                      `}
                    >
                      <span className={`
                        text-lg transition-all duration-200
                        ${isActive(item.path) ? 'animate-bounce' : 'group-hover:scale-110'}
                      `}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs rounded-full bg-pink-500 animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className={`
                          absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                          whitespace-nowrap z-50 border border-white/10
                          ${activeHover === item.path ? 'opacity-100' : 'opacity-0'}
                        `}>
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-pink-500">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                
                {/* Divider between categories */}
                {categoryIndex < menuCategories.length - 1 && !isCollapsed && (
                  <div className="border-t border-white/10 my-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Section - Always stays at bottom */}
        <div className="flex-shrink-0 border-t border-white/20 bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          {/* User Profile Card */}
          {!isCollapsed && (
            <div className="p-3 border-b border-white/10">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {styleConfig.title.includes('Cafe') ? 'CM' : 'SD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {styleConfig.title}
                    </p>
                    <p className="text-purple-200 text-xs truncate">
                      {styleConfig.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Logout Button - Fixed at bottom */}
          <div className="p-3">
            <button 
              onClick={onLogout}
              className={`
                w-full flex items-center p-3 rounded-xl 
                bg-gradient-to-r from-red-600 to-pink-600 
                hover:from-red-700 hover:to-pink-700
                transition-all duration-200 transform hover:scale-105
                active:scale-95 shadow-lg group
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
              `}
            >
              <span className="text-lg transform group-hover:scale-110 transition-transform">
                🚪
              </span>
              {!isCollapsed && (
                <span className="font-medium text-sm">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16"></div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default BaseSidebar;