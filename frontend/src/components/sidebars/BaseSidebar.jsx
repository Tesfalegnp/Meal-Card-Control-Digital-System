// frontend/src/components/sidebars/BaseSidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const BaseSidebar = ({ 
  isOpen, 
  onClose, 
  onLogout, 
  roleConfig 
}) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileDropdown = () => {
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  const isActive = (path) => location.pathname === path;
  const isSubMenuActive = (menuItems) => menuItems.some(item => isActive(item.path));

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      if (onClose) onClose();
      setIsMobileDropdownOpen(false);
    }
  };

  const {
    mainMenuItems,
    expandableMenus,
    styleConfig
  } = roleConfig;

  // Combine all menu items for mobile dropdown
  const allMobileMenuItems = [
    ...mainMenuItems,
    ...expandableMenus.flatMap(menu => menu.items)
  ];

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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${styleConfig.accentGradient} shadow-lg`}>
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
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-white/10 backdrop-blur-sm">
                <div className="p-2 max-h-96 overflow-y-auto">
                  {/* Main Menu Items */}
                  {mainMenuItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-white/20 text-white shadow-md'
                          : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs rounded-full bg-pink-500 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}

                  {/* Expandable Menus */}
                  {expandableMenus.map(menu => (
                    <div key={menu.key} className="mt-2">
                      <div className="flex items-center space-x-3 p-3 text-gray-200 border-l-2 border-purple-500 ml-2">
                        <span className="text-lg">{menu.icon}</span>
                        <span className="font-medium text-sm">{menu.label}</span>
                      </div>
                      <div className="ml-4 space-y-1 border-l-2 border-white/20 pl-2">
                        {menu.items.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-white/20 text-white shadow-md'
                                : 'text-gray-200 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-sm flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-xs rounded-full bg-pink-500 animate-pulse">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Logout Button in Dropdown */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Container - Hidden on mobile when not open */}
      <div 
        className={`
          hidden lg:flex fixed inset-y-0 left-0 z-50 
          ${isCollapsed ? 'w-16' : 'w-64'} 
          bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 
          text-white transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static 
          transition-all duration-300 ease-in-out 
          shadow-2xl border-r border-white/10
          backdrop-blur-sm bg-opacity-90
          flex-col
        `}
      >
        
        {/* Header Section - Desktop */}
        <div className={`
          flex items-center justify-between p-4 
          border-b border-white/20 
          ${isCollapsed ? 'flex-col space-y-2' : ''}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${styleConfig.accentGradient}
              shadow-lg transform transition-transform hover:scale-105
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
              hover:bg-white/10 active:scale-95
              ${isCollapsed ? 'rotate-180' : ''}
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

        {/* Navigation Section - Desktop */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Main Menu Items */}
          {mainMenuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={handleLinkClick}
              className={`
                flex items-center p-3 rounded-xl transition-all duration-200
                ${isCollapsed ? 'justify-center' : 'space-x-3'}
                ${isActive(item.path) 
                  ? `bg-white/20 shadow-lg ${styleConfig.accentShadow} text-white` 
                  : 'text-purple-100 hover:bg-white/10 hover:text-white hover:shadow-md'
                }
                group
              `}
            >
              <span className="text-lg transform group-hover:scale-110 transition-transform">
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
            </Link>
          ))}

          {/* Expandable Menus */}
          {expandableMenus.map(menu => (
            <div key={menu.key} className="mt-2">
              <button 
                onClick={() => toggleMenu(menu.key)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl 
                  transition-all duration-200 group
                  ${isSubMenuActive(menu.items) 
                    ? `bg-white/20 ${styleConfig.accentShadow} text-white` 
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {menu.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{menu.label}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <svg 
                    className={`
                      w-4 h-4 transition-transform duration-200 
                      ${expandedMenu === menu.key ? 'rotate-180' : ''}
                    `} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                )}
              </button>
              
              {/* Submenu Items */}
              {!isCollapsed && expandedMenu === menu.key && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/20 pl-2">
                  {menu.items.map(item => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      onClick={handleLinkClick}
                      className={`
                        flex items-center space-x-3 p-2 rounded-lg 
                        transition-all duration-200 group
                        ${isActive(item.path) 
                          ? 'bg-white/20 text-white shadow-md' 
                          : 'text-purple-100 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-pink-500 animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Section - Desktop */}
        <div className="mt-auto p-4 border-t border-white/20">
          <button 
            onClick={onLogout}
            className={`
              w-full flex items-center p-3 rounded-xl 
              bg-gradient-to-r from-red-600 to-pink-600 
              hover:from-red-700 hover:to-pink-700
              transition-all duration-200 transform hover:scale-[1.02]
              active:scale-95 shadow-lg
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
              group
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

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default BaseSidebar;