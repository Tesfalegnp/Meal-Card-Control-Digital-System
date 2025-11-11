//src/components/sidebars/StudentDeanSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const StudentDeanSidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard/studentDean', label: 'Dashboard', icon: '📊' },
    { path: '/students', label: 'Student Management', icon: '👨‍🎓' },
    { path: '/reports', label: 'Reports & Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8 p-4 text-center">
        <h1 className="text-xl font-bold text-white">MTU Meal System</h1>
        <p className="text-blue-200 text-sm">Student Dean Portal</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto pt-4 border-t border-blue-700">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="font-semibold">SD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Student Dean
            </p>
            <p className="text-xs text-blue-200 truncate">Administrator</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StudentDeanSidebar;