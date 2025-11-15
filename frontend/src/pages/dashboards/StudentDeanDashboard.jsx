// src/pages/dashboards/StudentDeanDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase_connect';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaChartBar, 
  FaClipboardList, 
  FaBell, 
  FaCog,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUserCheck,
  FaPrint,
  FaQrcode,
  FaSearch,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

const StudentDeanDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayMeals: 0,
    pendingRequests: 0,
    departments: 0,
    weeklyGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState('');

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Morning');
    else if (hour < 17) setTimeGreeting('Afternoon');
    else setTimeGreeting('Evening');
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id, status, department, registered_at');

      if (studentsError) throw studentsError;

      // Fetch today's meals
      const today = new Date().toISOString().split('T')[0];
      const { data: mealData, error: mealError } = await supabase
        .from('meal_records')
        .select('student_id')
        .eq('meal_date', today);

      if (mealError) throw mealError;

      // Calculate statistics
      const totalStudents = studentsData?.length || 0;
      const activeStudents = studentsData?.filter(s => s.status === 'active').length || 0;
      const todayMeals = mealData?.length || 0;
      const departments = [...new Set(studentsData?.map(s => s.department).filter(Boolean))].length;

      // Calculate department statistics
      const deptStats = studentsData?.reduce((acc, student) => {
        if (student.department) {
          acc[student.department] = (acc[student.department] || 0) + 1;
        }
        return acc;
      }, {});

      const formattedDeptStats = Object.entries(deptStats || {})
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalStudents,
        activeStudents,
        todayMeals,
        pendingRequests: Math.floor(Math.random() * 20) + 5, // Mock data for now
        departments,
        weeklyGrowth: 2.3 // Mock growth percentage
      });

      setDepartmentStats(formattedDeptStats);

      // Mock recent activities (replace with actual data from audit logs)
      setRecentActivities([
        { 
          id: 1, 
          type: 'registration', 
          description: '5 new students registered', 
          time: '2 hours ago', 
          icon: '👨‍🎓',
          priority: 'medium'
        },
        { 
          id: 2, 
          type: 'meal', 
          description: 'Lunch service completed - 450 students served', 
          time: '4 hours ago', 
          icon: '🍛',
          priority: 'low'
        },
        { 
          id: 3, 
          type: 'system', 
          description: 'System maintenance completed', 
          time: '6 hours ago', 
          icon: '⚙️',
          priority: 'low'
        },
        { 
          id: 4, 
          type: 'alert', 
          description: '3 students reported access issues', 
          time: '1 day ago', 
          icon: '⚠️',
          priority: 'high'
        }
      ]);

      // Mock upcoming events
      setUpcomingEvents([
        { id: 1, title: 'Monthly Department Meeting', date: '2024-01-25', type: 'meeting' },
        { id: 2, title: 'Student Feedback Session', date: '2024-01-28', type: 'event' },
        { id: 3, title: 'Academic Calendar Review', date: '2024-01-30', type: 'academic' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: 'Student Management',
      description: 'View and manage all students',
      icon: <FaUsers className="text-2xl" />,
      color: 'from-blue-500 to-cyan-500',
      link: '/students',
      badge: 'View All'
    },
    {
      id: 2,
      title: 'Academic Reports',
      description: 'Generate academic reports',
      icon: <FaChartBar className="text-2xl" />,
      color: 'from-green-500 to-emerald-500',
      badge: 'New'
    },
    {
      id: 3,
      title: 'Meal Analytics',
      description: 'View meal consumption data',
      icon: <FaClipboardList className="text-2xl" />,
      color: 'from-purple-500 to-pink-500',
      link: '/daily-status',
      badge: 'Live'
    },
    {
      id: 4,
      title: 'System Settings',
      description: 'Manage system configuration',
      icon: <FaCog className="text-2xl" />,
      color: 'from-orange-500 to-red-500',
      badge: 'Admin'
    }
  ];

  const StatCard = ({ title, value, change, icon, color, onClick }) => (
    <div 
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ action }) => (
    <div 
      className={`bg-gradient-to-r ${action.color} rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group relative overflow-hidden`}
      onClick={() => navigate(action.link)}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white bg-opacity-20 p-3 rounded-xl">
          {action.icon}
        </div>
        <div className="flex items-center gap-2">
          {action.badge && (
            <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs font-semibold">
              {action.badge}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{action.title}</h3>
      <p className="text-white text-opacity-80">{action.description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-semibold">Loading your dashboard...</p>
          <div className="mt-4 flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Good {timeGreeting}, Dean! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to your student management dashboard. Here's an overview of campus activities.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <button 
            className="bg-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 relative group"
            onClick={() => navigate('/complaints')}
          >
            <FaBell className="text-gray-600" />
            <span className="text-gray-700">Notifications</span>
            {stats.pendingRequests > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {stats.pendingRequests}
              </span>
            )}
          </button>
          <button 
            className="bg-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            onClick={() => navigate('/settings')}
          >
            <FaCog className="text-gray-600" />
            <span className="text-gray-700">Settings</span>
          </button>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>

      

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions & Department Stats */}
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              <button 
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                onClick={fetchDashboardData}
              >
                <FaSync />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Department Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Department Overview</h2>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => {
                const percentage = (dept.count / stats.totalStudents) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{dept.name}</span>
                      <span className="text-sm text-gray-600">{dept.count} students ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {departmentStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaGraduationCap className="text-4xl mx-auto mb-3 text-gray-400" />
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaBell className="text-blue-500" />
              Recent Activities
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="text-2xl mt-1">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                    activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaCalendarAlt />
              Upcoming Events
            </h3>
            <h1> 
              {/* Animated Icons */}
              <div className="mt-6 flex justify-center space-x-4">
                <div className="animate-bounce">🎓</div>
                <div className="animate-bounce delay-100">📚</div>
                <div className="animate-bounce delay-200">🏫</div>
                <div className="animate-bounce delay-300">📊</div>
              </div>
            </h1>
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <p className="font-semibold text-green-800">Student Portal</p>
              <p className="text-green-600 text-sm">Operational</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaQrcode className="text-green-600 text-xl" />
              </div>
              <p className="font-semibold text-green-800">QR System</p>
              <p className="text-green-600 text-sm">Operational</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaClipboardList className="text-green-600 text-xl" />
              </div>
              <p className="font-semibold text-green-800">Meal Tracking</p>
              <p className="text-green-600 text-sm">Operational</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaChartBar className="text-blue-600 text-xl" />
              </div>
              <p className="font-semibold text-blue-800">Reports</p>
              <p className="text-blue-600 text-sm">Processing</p>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/qr-print')}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-center transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FaPrint className="text-blue-600 text-xl" />
              </div>
              <p className="font-semibold text-blue-800">Print QR Codes</p>
            </button>
            <button
              onClick={() => navigate('/student-registration')}
              className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-center transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <p className="font-semibold text-green-800">Register Student</p>
            </button>
            <button
              onClick={() => navigate('/dean-reports')}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-center transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FaChartBar className="text-purple-600 text-xl" />
              </div>
              <p className="font-semibold text-purple-800">Generate Report</p>
            </button>
            <button
              onClick={() => navigate('/dean-analytics')}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 text-center transition-all hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <FaSearch className="text-orange-600 text-xl" />
              </div>
              <p className="font-semibold text-orange-800">View Analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button 
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
          onClick={() => navigate('/students')}
        >
          <FaUsers className="text-2xl" />
        </button>
        <button 
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          onClick={() => navigate('/qr-print')}
        >
          <FaPrint className="text-xl" />
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-bounce"></div>
      <div className="fixed top-1/2 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-25 animate-ping"></div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            🎓 Powered by Tesfalegn Petros at Mizan-Tepi University 2014 Software Department• {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm"
              onClick={() => navigate('/dean-settings')}
            >
              System Settings
            </button>
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm"
              onClick={() => navigate('/dean-complaints')}
            >
              Help & Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentDeanDashboard;