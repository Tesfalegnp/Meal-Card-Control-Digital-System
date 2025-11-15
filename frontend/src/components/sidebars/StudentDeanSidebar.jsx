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
          { path: '/dean-daily-status', label: 'Daily Attendance', icon: '📋' },
          { path: '/dean-analytics', label: 'Analytics', icon: '📈' },
        ]
      },
      {
        name: 'Student Management',
        icon: '👨‍🎓',
        items: [
          { path: '/students', label: 'All Students', icon: '👥', badge: '1.2K' },
          { path: '/student-registration', label: 'New Registration', icon: '➕' },
          { path: '/student-profiles', label: 'Student Profiles', icon: '📄' },
          { path: '/dean-student-view', label: 'Student Search', icon: '🔍' },
        ]
      },
      {
        name: 'Academic Oversight',
        icon: '📚',
        items: [
          { path: '/academic-performance', label: 'Performance', icon: '📊' },
          { path: '/attendance-reports', label: 'Attendance', icon: '✅' },
          { path: '/dean-complaints', label: 'Student Issues', icon: '📝', badge: '8' },
          { path: '/disciplinary-actions', label: 'Disciplinary', icon: '⚖️' },
        ]
      },
      {
        name: 'Meal Monitoring',
        icon: '🍽️',
        items: [
          { path: '/dean-meal-status', label: 'Meal Reports', icon: '📋' },
          { path: '/meal-compliance', label: 'Compliance', icon: '📊' },
          { path: '/dean-verify', label: 'Verify Students', icon: '✅' },
          { path: '/meal-exceptions', label: 'Exceptions', icon: '⚠️', badge: '5' },
        ]
      },
      {
        name: 'Administration',
        icon: '⚙️',
        items: [
          { path: '/dean-settings', label: 'System Settings', icon: '⚙️' },
          { path: '/audit-logs', label: 'Audit Logs', icon: '📋', badge: 'New' },
          { path: '/dean-reports', label: 'Reports', icon: '📑' },
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