// frontend/src/components/sidebars/StudentDeanSidebar.jsx
import React from 'react';
import BaseSidebar from './BaseSidebar';

const StudentDeanSidebar = ({ isOpen, onClose, onLogout }) => {
  const roleConfig = {
    styleConfig: {
      title: 'Student Dean',
      subtitle: 'Student Affairs',
      logoIcon: '🎓',
      accentGradient: 'from-purple-600 to-blue-500',
      accentShadow: 'shadow-purple-500/25'
    },
    mainMenuItems: [
      { path: '/dashboard/studentDean', label: 'Dashboard', icon: '📊' },
    ],
    expandableMenus: [
      {
        key: 'students',
        label: 'Student Management',
        icon: '👨‍🎓',
        items: [
          { path: '/students', label: 'Student Management', icon: '👨‍🎓', badge: '23' },
          { path: '/reports', label: 'Reports & Analytics', icon: '📈' },
        ]
      },
      {
        key: 'admin',
        label: 'Admin',
        icon: '⚙️',
        items: [
          { path: '/settings', label: 'System Settings', icon: '⚙️' },
          { path: '/audit', label: 'Audit Log', icon: '📋', badge: '5' },
          { path: '/support', label: 'Support', icon: '🛟' },
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