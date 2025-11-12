// src/components/sidebars/CafeManagerSidebar.jsx
import React from 'react';
import BaseSidebar from './BaseSidebar';

const CafeManagerSidebar = ({ isOpen, onClose, onLogout }) => {
  const roleConfig = {
    styleConfig: {
      title: 'Cafe Manager',
      subtitle: 'Administrator Portal',
      logoIcon: '🍽️',
      accentGradient: 'from-green-600 to-emerald-500',
      accentShadow: 'shadow-green-500/25'
    },
    mainMenuItems: [
      { path: '/dashboard/cafeManager', label: 'Dashboard', icon: '📊' },
      { path: '/daily-status', label: 'Daily Status', icon: '📋' },
      { path: '/qr-print', label: 'QR Printing', icon: '🖨️' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
    ],
    expandableMenus: [
      {
        key: 'students',
        label: 'Student Management',
        icon: '👨‍🎓',
        items: [
          { path: '/cafe-students-view', label: 'View Students', icon: '👥' },
          { path: '/student-view', label: 'Student Search', icon: '🔍' },
          { path: '/deny-management', label: 'Denied Students', icon: '🚫' },
        ]
      },
      {
        key: 'store',
        label: 'Store Management',
        icon: '🏪',
        items: [
          { path: '/stock-register', label: 'New Stock Register', icon: '📦' },
          { path: '/stock-remain', label: 'Remaining Stock', icon: '📊' },
          { path: '/inventory', label: 'Inventory Management', icon: '🗃️' },
          { path: '/supplier', label: 'Supplier Management', icon: '🚚' },
        ]
      },
      {
        key: 'features',
        label: 'More Features',
        icon: '🔧',
        items: [
          { path: '/reports', label: 'Daily Reports', icon: '📑' },
          { path: '/analytics', label: 'Analytics', icon: '📊' },
          { path: '/meal-planning', label: 'Meal Planning', icon: '🍽️' },
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

export default CafeManagerSidebar;