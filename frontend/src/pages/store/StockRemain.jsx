// src/pages/store/StockRemain.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';

const StockRemain = () => {
  const [inventory, setInventory] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    fetchData();
    fetchWeeklyMenu();
  }, [filter, showPending]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });
      
      if (studentsError) throw studentsError;
      setStudentsCount(studentsData?.length || 0);

      let inventoryQuery;
      
      if (showPending) {
        // Show pending approval items
        inventoryQuery = supabase
          .from('food_inventory')
          .select('*')
          .or('approved_by_committee.eq.false,approved_by_president.eq.false')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
      } else {
        // Show only fully approved items for stock analysis
        inventoryQuery = supabase
          .from('food_inventory')
          .select('*')
          .eq('approved_by_committee', true)
          .eq('approved_by_president', true)
          .eq('status', 'active')
          .order('food_item');

        if (filter !== 'all') {
          if (filter === 'low') {
            inventoryQuery = inventoryQuery.lte('current_stock', supabase.raw('min_stock_level'));
          } else if (filter === 'critical') {
            inventoryQuery = inventoryQuery.lte('current_stock', supabase.raw('min_stock_level * 0.5'));
          }
        }
      }

      const { data: inventoryData, error: inventoryError } = await inventoryQuery;

      if (inventoryError) {
        // If approval columns don't exist, fall back to old behavior
        if (inventoryError.code === '42703') {
          console.warn('Approval columns not found, using legacy mode');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('food_inventory')
            .select('*')
            .eq('status', 'active')
            .order('food_item');

          if (fallbackError) throw fallbackError;
          setInventory(fallbackData || []);
          setPendingItems([]);
          return;
        }
        throw inventoryError;
      }

      if (showPending) {
        setPendingItems(inventoryData || []);
        setInventory([]);
      } else {
        setInventory(inventoryData || []);
        setPendingItems([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_schedule')
        .select('*');
      
      if (!error) {
        setWeeklyMenu(data || []);
      }
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
    }
  };

  const calculatePredictedDays = (item) => {
    if (!item.consumption_per_student || studentsCount === 0) return 0;
    
    const dailyConsumption = item.consumption_per_student * studentsCount * 3;
    return dailyConsumption > 0 ? Math.floor(item.current_stock / dailyConsumption) : 0;
  };

  const calculateWeeklyRequirement = (item) => {
    if (!item.consumption_per_student || studentsCount === 0) return 0;
    return item.consumption_per_student * studentsCount * 21; // 3 meals × 7 days
  };

  const getStockStatus = (item) => {
    const predictedDays = calculatePredictedDays(item);
    const minStockLevel = item.min_stock_level || 0;
    const weeklyRequirement = calculateWeeklyRequirement(item);
    
    if (item.current_stock <= minStockLevel * 0.3) {
      return { 
        level: 'critical', 
        text: 'CRITICAL', 
        color: 'from-red-500 to-red-600', 
        bgColor: 'from-red-50 to-red-100',
        borderColor: 'border-red-200',
        icon: '🚨'
      };
    } else if (item.current_stock <= minStockLevel) {
      return { 
        level: 'low', 
        text: 'LOW', 
        color: 'from-orange-500 to-orange-600',
        bgColor: 'from-orange-50 to-orange-100',
        borderColor: 'border-orange-200',
        icon: '⚠️'
      };
    } else if (predictedDays <= 7) {
      return { 
        level: 'warning', 
        text: 'WATCH', 
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'from-yellow-50 to-yellow-100',
        borderColor: 'border-yellow-200',
        icon: '🔔'
      };
    } else {
      return { 
        level: 'good', 
        text: 'GOOD', 
        color: 'from-green-500 to-green-600',
        bgColor: 'from-green-50 to-green-100',
        borderColor: 'border-green-200',
        icon: '✅'
      };
    }
  };

  const getApprovalStatus = (item) => {
    if (item.approved_by_committee && item.approved_by_president) {
      return { 
        status: 'approved', 
        text: 'FULLY APPROVED', 
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (item.approved_by_committee && !item.approved_by_president) {
      return { 
        status: 'pending_president', 
        text: 'PENDING PRESIDENT', 
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else if (!item.approved_by_committee && !item.approved_by_president) {
      return { 
        status: 'pending_committee', 
        text: 'PENDING COMMITTEE', 
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
    return { 
      status: 'unknown', 
      text: 'UNKNOWN', 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const getLowStockItems = () => {
    return inventory.filter(item => 
      item.current_stock <= (item.min_stock_level || 0)
    ).length;
  };

  const getCriticalStockItems = () => {
    return inventory.filter(item => 
      item.current_stock <= ((item.min_stock_level || 0) * 0.3)
    ).length;
  };

  const getPendingApprovalCount = () => {
    return pendingItems.length;
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => {
      return total + (item.current_stock * (item.unit_price || 1));
    }, 0);
  };

  const filteredInventory = showPending ? 
    pendingItems.filter(item =>
      item.food_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) :
    inventory.filter(item =>
      item.food_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {showPending ? 'Pending Approval Items' : 'Remaining Stock Analysis'}
          </h1>
          <p className="text-gray-600 text-lg">
            {showPending 
              ? 'Items waiting for committee and president approval' 
              : 'Current inventory status and consumption predictions'
            }
          </p>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPending(false)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  !showPending
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Stock Analysis
              </button>
              <button
                onClick={() => setShowPending(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  showPending
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending Approval ({getPendingApprovalCount()})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <span className="text-white text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {showPending ? 'Pending Items' : 'Approved Items'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {showPending ? pendingItems.length : inventory.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <span className="text-white text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{getLowStockItems()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <span className="text-white text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{getCriticalStockItems()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <span className="text-white text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{studentsCount}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search items or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              
              {!showPending && (
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="all">All Items</option>
                  <option value="low">Low Stock</option>
                  <option value="critical">Critical Stock</option>
                </select>
              )}
            </div>
            
            <motion.button
              onClick={fetchData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 shadow-lg transition-all duration-200"
            >
              Refresh Data
            </motion.button>
          </div>
        </motion.div>

        {/* Inventory Grid */}
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredInventory.map((item) => {
              const predictedDays = calculatePredictedDays(item);
              const weeklyRequirement = calculateWeeklyRequirement(item);
              const status = showPending ? getApprovalStatus(item) : getStockStatus(item);
              
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`bg-gradient-to-br ${status.bgColor} rounded-2xl shadow-lg p-6 border ${status.borderColor} relative overflow-hidden`}
                >
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${status.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                    <span>{status.icon}</span>
                    {status.text}
                  </div>

                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.food_item}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>

                  {showPending ? (
                    /* Pending Approval View */
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-700">Current Stock</p>
                          <p className="text-lg font-bold text-gray-900">
                            {item.current_stock} {item.unit}
                          </p>
                        </div>
                        
                        {/* Approval Progress */}
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Committee Approval</span>
                            <span className={`text-xs font-semibold ${
                              item.approved_by_committee ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {item.approved_by_committee ? '✓ Approved' : '⏳ Pending'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">President Approval</span>
                            <span className={`text-xs font-semibold ${
                              item.approved_by_president ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {item.approved_by_president ? '✓ Approved' : '⏳ Waiting'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Supplier</p>
                          <p className="font-semibold text-gray-900 truncate">{item.supplier || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Storage</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {item.storage_condition.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="text-center p-2 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600">Registered</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Stock Analysis View */
                    <div className="space-y-4">
                      {/* Stock Information */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-700">Current Stock</p>
                          <p className="text-lg font-bold text-gray-900">
                            {item.current_stock} {item.unit}
                          </p>
                        </div>
                        {item.min_stock_level > 0 && (
                          <p className="text-xs text-gray-500">
                            Minimum: {item.min_stock_level} {item.unit}
                          </p>
                        )}
                      </div>

                      {/* Weekly Requirement */}
                      <div className="bg-white rounded-lg p-3 shadow-inner">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Weekly Requirement</p>
                        <p className="text-lg font-bold text-blue-600">
                          {weeklyRequirement.toFixed(2)} {item.unit}/week
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {studentsCount} students × 21 meals
                        </p>
                      </div>

                      {/* Prediction Card */}
                      <div className="bg-white rounded-lg p-4 shadow-inner border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Will Last For</p>
                            <p className="text-xs text-gray-500">Based on current usage</p>
                          </div>
                          <div className={`text-right ${
                            predictedDays <= 3 ? 'text-red-600' : 
                            predictedDays <= 7 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            <p className="text-2xl font-bold">{predictedDays}</p>
                            <p className="text-xs font-semibold">DAYS</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((predictedDays / 30) * 100, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-2 rounded-full ${
                                predictedDays <= 7 ? 'bg-red-500' : 
                                predictedDays <= 14 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            ></motion.div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>30 days</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Storage</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {item.storage_condition.replace('_', ' ')}
                          </p>
                        </div>
                        {item.supplier && (
                          <div>
                            <p className="text-gray-600">Supplier</p>
                            <p className="font-semibold text-gray-900 truncate">{item.supplier}</p>
                          </div>
                        )}
                      </div>

                      {/* Consumption Rate */}
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">Consumption Rate</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.consumption_per_student} {item.unit}/student/meal
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredInventory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="text-6xl mb-4">
              {showPending ? '⏳' : '📦'}
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {showPending 
                ? 'No items pending approval' 
                : 'No inventory items found'
              }
            </p>
            <p className="text-gray-400">
              {showPending 
                ? 'All items have been approved or no new registrations' 
                : 'Register new stock to see analysis'
              }
            </p>
          </motion.div>
        )}

        {/* Summary Statistics */}
        {!showPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{inventory.length}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {inventory.filter(item => getStockStatus(item).level === 'good').length}
                </p>
                <p className="text-sm text-gray-600">Good Stock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{getLowStockItems()}</p>
                <p className="text-sm text-gray-600">Low Stock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{getCriticalStockItems()}</p>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StockRemain;