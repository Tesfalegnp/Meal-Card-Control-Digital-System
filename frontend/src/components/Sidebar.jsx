// src/components/Sidebar.jsx
import React from 'react';
import StudentDeanSidebar from './sidebars/StudentDeanSidebar';
import CafeManagerSidebar from './sidebars/CafeManagerSidebar';

const SmartSidebar = ({ user, onLogout, isOpen, onClose }) => {
  // Determine user role and render appropriate sidebar
  const renderSidebar = () => {
    // You can modify this logic based on your user role detection
    const userRole = user?.role || 'cafe_manager'; // Default for demo
    
    switch (userRole) {
      case 'student_dean':
        return <StudentDeanSidebar isOpen={isOpen} onClose={onClose} onLogout={onLogout} />;
      case 'cafe_manager':
      default:
        return <CafeManagerSidebar isOpen={isOpen} onClose={onClose} onLogout={onLogout} />;
    }
  };

  return renderSidebar();
};

export default SmartSidebar;