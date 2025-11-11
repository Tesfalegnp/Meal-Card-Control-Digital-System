//src/components/sidebars/StudentDeanSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const StudentDeanSidebar = ({ onLogout }) => {
  const location = useLocation();
  
  // Mock user data
  const userProfile = {
    name: 'Dr. Sarah Johnson',
    role: 'Student Dean',
    avatar: '/src/assets/images/image.png', // Fixed the path
    department: 'Student Affairs',
  };

  const menuItems = [
    { path: '/dashboard/studentDean', label: 'Dashboard', icon: '📊', badge: null },
    { path: '/students', label: 'Student Management', icon: '👨‍🎓', badge: '23' },
    { path: '/reports', label: 'Reports & Analytics', icon: '📈', badge: null },
    { path: '/settings', label: 'System Settings', icon: '⚙️', badge: null },
    { path: '/audit', label: 'Audit Log', icon: '📋', badge: '5' },
    { path: '/support', label: 'Support', icon: '🛟', badge: null },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
      
      {/* Header with Personal Details */}
      <div className="p-6 border-b border-white/10 relative z-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative mr-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 overflow-hidden">
              {/* Avatar Image with fallback */}
              <img 
                src={userProfile.avatar} 
                alt="User avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback initial */}
              <div className="w-full h-full hidden items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
                <span className="text-xl font-bold text-white">SJ</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-slate-900 rounded-full"></div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {userProfile.name}
            </h2>
            <p className="text-purple-200 text-sm font-medium truncate">{userProfile.role}</p>
            <p className="text-purple-300 text-xs truncate">{userProfile.department}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 relative z-10">
        <div className="mb-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path} className="list-none">
                <Link
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden no-underline hover:no-underline focus:no-underline ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-purple-100 hover:bg-white/10 hover:text-white hover:shadow-lg border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${
                      isActive(item.path) ? 'scale-110' : ''
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 text-center ${
                      isActive(item.path) 
                        ? 'bg-white/20 text-white' 
                        : 'bg-pink-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="absolute right-4 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="text-center mt-3">
          <p className="text-xs text-purple-400">
            2025 © MTU University
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDeanSidebar;