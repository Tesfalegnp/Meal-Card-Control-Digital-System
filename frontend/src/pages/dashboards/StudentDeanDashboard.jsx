// src/pages/dashboards/StudentDeanDashboard.jsx

import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StudentDeanSidebar from '../../components/sidebars/StudentDeanSidebar';

const StudentDeanDashboard = ({ onLogout }) => {
  // Mock data - replace with actual data from your API
  const stats = [
    { label: 'Total Students', value: '1,247', icon: '👨‍🎓', color: 'blue' },
    { label: 'Active Cards', value: '1,189', icon: '💳', color: 'green' },
    { label: 'Pending Requests', value: '23', icon: '⏳', color: 'yellow' },
    { label: 'Today\'s Meals', value: '856', icon: '🍽️', color: 'purple' },
  ];

  const recentActivities = [
    { action: 'New student registered', time: '2 hours ago', type: 'registration' },
    { action: 'Meal card approved', time: '4 hours ago', type: 'approval' },
    { action: 'System backup completed', time: '6 hours ago', type: 'system' },
    { action: 'Monthly report generated', time: '1 day ago', type: 'report' },
  ];

  return (
    <DashboardLayout sidebar={StudentDeanSidebar} onLogout={onLogout}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Student Dean!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your meal card system today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`text-2xl bg-${stat.color}-100 p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center">
              <div className="text-2xl mb-2">👨‍🎓</div>
              <span className="font-medium">Manage Students</span>
            </button>
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <span className="font-medium">View Reports</span>
            </button>
            <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <span className="font-medium">Settings</span>
            </button>
            <button className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center">
              <div className="text-2xl mb-2">🆘</div>
              <span className="font-medium">Help</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDeanDashboard;