// src/pages/dashboards/CafeManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUtensils, 
  FaUsers, 
  FaChartBar, 
  FaShoppingCart, 
  FaBell, 
  FaCog,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaStar,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaQrcode,
  FaPrint,
  FaRegCompass,
  FaUserPlus,
  FaShieldAlt,
  FaRegChartBar,
  FaCogs,
  FaStore,
  FaHamburger
} from 'react-icons/fa';
import { supabase } from '../../services/supabase_connect';

const CafeManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayMeals: 0,
    weeklyRevenue: 0,
    activeStudents: 0,
    menuItems: 0,
    pendingComplaints: 0,
    lowStockItems: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch today's meal count
        const today = new Date().toISOString().split('T')[0];
        const { count: todayMeals } = await supabase
          .from('meal_records')
          .select('*', { count: 'exact', head: true })
          .eq('meal_date', today);

        // Fetch student count
        const { count: activeStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Mock data for demonstration
        setStats({
          todayMeals: todayMeals || 245,
          weeklyRevenue: 12540,
          activeStudents: activeStudents || 1560,
          menuItems: 28,
          pendingComplaints: 12,
          lowStockItems: 5
        });

        setRecentActivities([
          { id: 1, type: 'meal', description: 'Lunch rush hour completed', time: '2 hours ago', icon: '🍛', priority: 'low' },
          { id: 2, type: 'order', description: 'New inventory order placed', time: '4 hours ago', icon: '📦', priority: 'medium' },
          { id: 3, type: 'student', description: '15 new students registered', time: '1 day ago', icon: '👨‍🎓', priority: 'low' },
          { id: 4, type: 'maintenance', description: 'Kitchen equipment maintenance', time: '2 days ago', icon: '🔧', priority: 'high' },
          { id: 5, type: 'complaint', description: '3 new complaints received', time: '3 hours ago', icon: '⚠️', priority: 'high' }
        ]);

        setPopularItems([
          { id: 1, name: 'Chicken Biryani', orders: 156, trend: 'up', rating: 4.8 },
          { id: 2, name: 'Vegetable Pasta', orders: 142, trend: 'up', rating: 4.6 },
          { id: 3, name: 'Beef Burger', orders: 128, trend: 'down', rating: 4.4 },
          { id: 4, name: 'Fruit Salad', orders: 115, trend: 'up', rating: 4.9 }
        ]);

        setUpcomingEvents([
          { id: 1, title: 'Monthly Stock Audit', date: '2024-01-25', type: 'inventory' },
          { id: 2, title: 'Student Feedback Meeting', date: '2024-01-28', type: 'meeting' },
          { id: 3, title: 'Kitchen Deep Cleaning', date: '2024-01-30', type: 'maintenance' }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      id: 1,
      title: 'Manage Menu',
      description: 'Update today\'s offerings',
      icon: <FaUtensils className="text-2xl" />,
      color: 'from-orange-500 to-red-500',
      link: '/weekly-menu',
      badge: 'Updated'
    },
    {
      id: 2,
      title: 'Student Management',
      description: 'View student profiles',
      icon: <FaUsers className="text-2xl" />,
      color: 'from-blue-500 to-cyan-500',
      link: '/students',
      badge: '1560'
    },
    {
      id: 3,
      title: 'Daily Reports',
      description: 'Generate meal reports',
      icon: <FaChartBar className="text-2xl" />,
      color: 'from-green-500 to-emerald-500',
      link: '/daily-status',
      badge: 'New'
    },
    {
      id: 4,
      title: 'Inventory',
      description: 'Check stock levels',
      icon: <FaShoppingCart className="text-2xl" />,
      color: 'from-purple-500 to-pink-500',
      link: '/inventory',
      badge: `${stats.lowStockItems} Low`
    },
    {
      id: 5,
      title: 'QR Management',
      description: 'Print student QR codes',
      icon: <FaQrcode className="text-2xl" />,
      color: 'from-indigo-500 to-blue-500',
      link: '/qr-print',
      badge: 'Print'
    },
    {
      id: 6,
      title: 'Complaints',
      description: 'View student feedback',
      icon: <FaExclamationTriangle className="text-2xl" />,
      color: 'from-yellow-500 to-orange-500',
      link: '/complaints',
      badge: `${stats.pendingComplaints} New`
    }
  ];

  const managementFeatures = [
    {
      id: 1,
      title: 'Supplier Management',
      description: 'Manage food suppliers',
      icon: <FaUserPlus className="text-xl" />,
      link: '/supplier-management',
      color: 'bg-teal-500'
    },
    {
      id: 2,
      title: 'Stock Register',
      description: 'Track inventory movements',
      icon: <FaClipboardList className="text-xl" />,
      link: '/stock-register',
      color: 'bg-amber-500'
    },
    {
      id: 3,
      title: 'Deny Management',
      description: 'Handle access issues',
      icon: <FaShieldAlt className="text-xl" />,
      link: '/deny-management',
      color: 'bg-rose-500'
    },
    {
      id: 4,
      title: 'Analytics',
      description: 'Detailed reports & insights',
      icon: <FaRegChartBar className="text-xl" />,
      link: '/analytics',
      color: 'bg-violet-500'
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
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(change)}% from yesterday
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
          <FaStar className="text-yellow-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{action.title}</h3>
      <p className="text-white text-opacity-80">{action.description}</p>
    </div>
  );

  const FeatureCard = ({ feature }) => (
    <div 
      className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
      onClick={() => navigate(feature.link)}
    >
      <div className="flex items-center gap-3">
        <div className={`${feature.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
          {feature.icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{feature.title}</h4>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
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
            Good {timeGreeting}, Manager! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to manage today's cafeteria operations? Here's your overview.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <button 
            className="bg-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 relative group"
            onClick={() => navigate('/complaints')}
          >
            <FaBell className="text-gray-600" />
            <span className="text-gray-700">Notifications</span>
            {stats.pendingComplaints > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {stats.pendingComplaints}
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
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Today's Meals"
          value={stats.todayMeals}
          change={12}
          icon={<FaUtensils />}
          color="from-orange-500 to-red-500"
          onClick={() => navigate('/daily-status')}
        />
        <StatCard
          title="Weekly Revenue"
          value={`$${stats.weeklyRevenue.toLocaleString()}`}
          change={8}
          icon={<FaMoneyBillWave />}
          color="from-green-500 to-emerald-500"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents.toLocaleString()}
          change={5}
          icon={<FaUsers />}
          color="from-blue-500 to-cyan-500"
          onClick={() => navigate('/students')}
        />
        <StatCard
          title="Menu Items"
          value={stats.menuItems}
          change={-2}
          icon={<FaClipboardList />}
          color="from-purple-500 to-pink-500"
          onClick={() => navigate('/weekly-menu')}
        />
        <StatCard
          title="Pending Complaints"
          value={stats.pendingComplaints}
          change={25}
          icon={<FaExclamationTriangle />}
          color="from-yellow-500 to-amber-500"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          change={-10}
          icon={<FaShoppingCart />}
          color="from-rose-500 to-pink-500"
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* Quick Actions & Management Features */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              <button 
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                onClick={() => window.location.reload()}
              >
                <FaSync />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>

          {/* Management Features */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Management Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {managementFeatures.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Popular Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaHamburger className="text-orange-500" />
              Popular This Week
            </h2>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">{item.orders} orders</p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FaStar className="text-xs" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaCalendarAlt />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white bg-opacity-20 p-4 rounded-xl hover:bg-opacity-30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{event.title}</span>
                    <span className="text-blue-100 text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Animated Food Icons */}
            <div className="mt-6 flex justify-center space-x-4">
              <div className="animate-bounce">🍕</div>
              <div className="animate-bounce delay-100">🍔</div>
              <div className="animate-bounce delay-200">🥗</div>
              <div className="animate-bounce delay-300">🍰</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="text-2xl">{activity.icon}</div>
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

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaRegCompass className="text-blue-500" />
            Today's Meal Schedule
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">Breakfast</span>
                <span className="text-green-600 font-medium">7:00 - 9:00 AM</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Expected: 450 students</span>
                <span className="text-green-500">● Active Now</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">Lunch</span>
                <span className="text-blue-600 font-medium">12:00 - 2:00 PM</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Expected: 680 students</span>
                <span className="text-blue-500">▲ Upcoming</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">Dinner</span>
                <span className="text-purple-600 font-medium">6:00 - 8:00 PM</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Expected: 520 students</span>
                <span className="text-purple-500">▲ Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button 
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
          onClick={() => navigate('/verify')}
        >
          <FaQrcode className="text-2xl" />
        </button>
        <button 
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          onClick={() => navigate('/qr-print')}
        >
          <FaPrint className="text-xl" />
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
      <div className="fixed top-1/2 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-25 animate-ping"></div>
      <div className="fixed top-1/3 right-1/4 w-14 h-14 bg-purple-200 rounded-full opacity-20 animate-pulse delay-75"></div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            💫 Powered by Mizan-Tepi University Meal System • {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm"
              onClick={() => navigate('/settings')}
            >
              System Settings
            </button>
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm"
              onClick={() => navigate('/complaints')}
            >
              Help & Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CafeManagerDashboard;