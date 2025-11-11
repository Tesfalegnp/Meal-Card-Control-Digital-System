import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CafeManagerSidebar = ({ isOpen, onClose, onLogout }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar minimize toggle

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => location.pathname === path;
  const isSubMenuActive = (menuItems) => menuItems.some(item => isActive(item.path));

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  // === Menu Data ===
  const mainMenuItems = [
    { path: '/dashboard/cafeManager', label: 'Dashboard', icon: '📊' },
    { path: '/daily-status', label: 'Daily Status', icon: '📋' },
    { path: '/qr-print', label: 'QR Printing', icon: '🖨️' },
  ];

  const studentMenuItems = [
    { path: '/students', label: 'All Students', icon: '👥' },
    { path: '/student-view', label: 'Student Search', icon: '🔍' },
    { path: '/deny-management', label: 'Denied Students', icon: '🚫' },
    { path: '/student-reports', label: 'Student Reports', icon: '📈' },
  ];

  const storeMenuItems = [
    { path: '/stock-register', label: 'New Stock Register', icon: '📦' },
    { path: '/stock-remain', label: 'Remaining Stock', icon: '📊' },
    { path: '/inventory', label: 'Inventory Management', icon: '🗃️' },
    { path: '/supplier', label: 'Supplier Management', icon: '🚚' },
  ];

  const accountMenuItems = [
    { path: '/profile', label: 'My Profile', icon: '👤' },
    { path: '/change-password', label: 'Change Password', icon: '🔒' },
    { path: '/preferences', label: 'Preferences', icon: '⚙️' },
  ];

  const featuresMenuItems = [
    { path: '/reports', label: 'Daily Reports', icon: '📑' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/meal-planning', label: 'Meal Planning', icon: '🍽️' },
    { path: '/waste-management', label: 'Waste Tracking', icon: '🗑️' },
    { path: '/staff-management', label: 'Staff Management', icon: '👨‍💼' },
    { path: '/billing', label: 'Billing & Payments', icon: '💰' },
  ];

  return (
    <>
      {/* --- Mobile Overlay --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* --- Sidebar Container --- */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-green-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static transition-all duration-300 ease-in-out shadow-xl`}
      >
        {/* --- Top Logo & Collapse Toggle --- */}
        <div
          className={`flex items-center justify-between p-4 border-b border-green-700 ${
            isCollapsed ? 'flex-col space-y-2' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold">MTU Meal System</h1>
                <p className="text-green-200 text-xs">Cafe Manager Portal</p>
              </div>
            )}
          </div>

          {/* Collapse/Expand Button */}
          <button
            onClick={toggleCollapse}
            className="text-green-200 hover:text-white transition-transform"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transform transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
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

        {/* --- Navigation --- */}
        <nav className="flex-1 overflow-y-auto p-2">
          {mainMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-green-700 text-white shadow-lg'
                  : 'text-green-100 hover:bg-green-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}

          {[
            { id: 'students', title: 'Student Management', icon: '👨‍🎓', items: studentMenuItems },
            { id: 'store', title: 'Store Management', icon: '🏪', items: storeMenuItems },
            { id: 'account', title: 'Account', icon: '👤', items: accountMenuItems },
            { id: 'features', title: 'More Features', icon: '🔧', items: featuresMenuItems },
          ].map((section) => (
            <div key={section.id} className="mt-2">
              <button
                onClick={() => toggleMenu(section.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isSubMenuActive(section.items)
                    ? 'bg-green-700 text-white'
                    : 'text-green-100 hover:bg-green-800 hover:text-white'
                }`}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center w-full' : 'space-x-3'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{section.title}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedMenu === section.id ? 'rotate-180' : ''
                    }`}
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

              {!isCollapsed && expandedMenu === section.id && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-green-600 text-white'
                          : 'text-green-100 hover:bg-green-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            to="/settings"
            onClick={handleLinkClick}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } p-3 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-green-700 text-white shadow-lg'
                : 'text-green-100 hover:bg-green-800 hover:text-white'
            }`}
          >
            <span className="text-lg">⚙️</span>
            {!isCollapsed && <span className="font-medium">System Settings</span>}
          </Link>
        </nav>

        {/* --- Bottom User Section --- */}
        <div className="mt-auto p-4 border-t border-green-700">
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } p-3 rounded-lg bg-green-800/50 mb-2`}
          >
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="font-semibold">CM</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Cafe Manager
                </p>
                <p className="text-xs text-green-200 truncate">Administrator</p>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } p-3 text-green-100 hover:bg-green-800 hover:text-white rounded-lg transition-colors border border-green-700`}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default CafeManagerSidebar;
