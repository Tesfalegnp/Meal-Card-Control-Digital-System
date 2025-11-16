// frontend/src/components/sidebars/StudentDeanSidebar.jsx
import React from 'react';
import BaseSidebar from './BaseSidebar';

const StudentDeanSidebar = ({ isOpen, onClose, onLogout }) => {
  const roleConfig = {
    styleConfig: {
      title: 'Student Dean',
      subtitle: 'Student Affairs Portal',
      logoIcon: '🎓',
      accentGradient: 'from-purple-600 to-blue-500',
      accentShadow: 'shadow-purple-500/25'
    },
    menuCategories: [
      {
        name: 'Dashboard',
        icon: '📊',
        items: [
          { path: '/dashboard/studentDean', label: 'Dashboard Overview', icon: '🏠', badge: 'Live' },
        ]
      },
      {
        name: 'Student Management',
        icon: '👨‍🎓',
        items: [
          { path: '/students', label: 'All Students', icon: '👥', badge: '1.2K' },
          { path: '/register', label: 'New Registration', icon: '➕' },
        ]
      },
      {
        name: 'Meal Monitoring',
        icon: '🍽️',
        items: [
          { path: '/daily-status', label: 'Meal Reports', icon: '📋' },
          { path: '/verify', label: 'Verify Students', icon: '✅' },
          { path: '/deny-management', label: 'Deny Management', icon: '⚠️', badge: '5' },
        ]
      },
      {
        name: 'Store & Inventory',
        icon: '📦',
        items: [
          { path: '/stock-remain', label: 'Stock Analysis', icon: '📊' },
          { path: '/inventory', label: 'Inventory Management', icon: '🗃️' },
          { path: '/supplier-management', label: 'Suppliers', icon: '🤝' },
        ]
      },
      {
        name: 'System Management',
        icon: '⚙️',
        items: [
          { path: '/weekly-menu', label: 'Weekly Menu', icon: '📅' },
          { path: '/complaints', label: 'Complaints', icon: '📝', badge: '8' },
          { path: '/qr-print', label: 'QR Print', icon: '🖨️' },
          { path: '/settings', label: 'Settings', icon: '⚙️' },
        ]
      }
    ]
  };

  return (
    <BaseSidebar
      isOpen={isOpen}
      onClose={onClose}
      onLogout={onLogout}
      roleConfig={roleConfig}
    />
  );
};

export default StudentDeanSidebar;