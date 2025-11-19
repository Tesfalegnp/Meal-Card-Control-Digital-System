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
    menuCategories: [
      {
        name: 'Dashboard',
        icon: '📊',
        items: [
          { path: '/dashboard/cafeManager', label: 'Dashboard Overview', icon: '🏠', badge: 'New' },
          { path: '/daily-status', label: 'Daily Status', icon: '📋', badge: 'Live' },
             ]
      },
      {
        name: 'Meal Management',
        icon: '🍽️',
        items: [
          { path: '/weekly-menu', label: 'Weekly Menu Planning', icon: '🗓️' },
          { path: '/verif', label: 'Verify QR Code', icon: '✅', badge: 'Scan' },
          { path: '/rfid-scan', label: 'Verify RFID', icon: '✅', badge: 'Scan' },
        ]
      },
      {
        name: 'Student Management',
        icon: '👨‍🎓',
        items: [
          { path: '/cafe-students-view', label: 'All Students', icon: '👥' },
          { path: '/student-view', label: 'Student Search', icon: '🔍' },
          { path: '/deny-management', label: 'Access Control', icon: '🚫', badge: '3' },
          { path: '/qr-print', label: 'QR Code Printing', icon: '🖨️' },
        ]
      },
      {
        name: 'Inventory & Store',
        icon: '🏪',
        items: [
          { path: '/inventory', label: 'Inventory', icon: '📦', badge: '5 Low' },
          { path: '/stock-register', label: 'Stock Register', icon: '📊' },
          { path: '/stock-remain', label: 'Stock Levels', icon: '⚖️' },
          { path: '/Supplier_View', label: 'Suppliers', icon: '🚚' },
        ]
      },
      {
        name: 'Communication',
        icon: '💬',
        items: [
          { path: '/complaints', label: 'Complaints', icon: '📝', badge: '12' },
          { path: '/reports', label: 'Reports', icon: '📑' },
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

export default CafeManagerSidebar;