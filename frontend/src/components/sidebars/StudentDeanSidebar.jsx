// src/components/sidebars/CafeManagerSidebar.jsx
import React from 'react';
import BaseSidebar from './BaseSidebar';

const StudentDeanSidebar = ({ isOpen, onClose, onLogout }) => {
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
      { path: '/support', label: 'Support', icon: '🛟' },
      { path: '/daily-status', label: 'Daily Status', icon: '📋' },
      { path: '/qr-print', label: 'QR Printing', icon: '🖨️' },
      { path: '/audit', label: 'Audit Log', icon: '📋', badge: '5' },
      { path: '/settings', label: 'System Settings', icon: '⚙️' },
      { path: '/reports', label: 'Reports & Analytics', icon: '📈' },
      { path: '/students', label: 'Student Management', icon: '👨‍🎓', badge: '23' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
      { path: '/dashboard/studentDean', label: 'Dashboard', icon: '📊' },
 
    ],
    expandableMenus: [ ]
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

