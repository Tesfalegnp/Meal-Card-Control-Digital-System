// src/pages/store/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    food_item: '',
    current_stock: '',
    unit: 'kg',
    consumption_per_student: '',
    category: 'grains',
    supplier: '',
    storage_condition: 'room_temp',
    min_stock_level: '',
    notification_emails: ''
  });
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [studentsCount, setStudentsCount] = useState(0);
  const [weeklyConsumption, setWeeklyConsumption] = useState({});

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchStudentsCount();
    calculateWeeklyConsumption();
  }, []);

  const fetchStudentsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });
      
      if (!error && data) {
        setStudentsCount(data.length || 0);
      }
    } catch (error) {
      console.error('Error fetching students count:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('food_inventory')
        .select('*')
        .order('food_item');

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('category_code, category_name')
        .order('category_name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateWeeklyConsumption = async () => {
    try {
      // Get weekly menu and calculate total consumption
      const { data: menuData } = await supabase
        .from('menu_schedule')
        .select('*');
      
      const { data: recipeData } = await supabase
        .from('recipe_ingredients')
        .select(`
          quantity_required,
          unit,
          food_inventory(id, food_item)
        `);

      // This would be more complex in reality - calculating based on actual menu
      // For now, we'll use the existing consumption_per_student method
      const consumption = {};
      inventory.forEach(item => {
        consumption[item.id] = item.consumption_per_student * studentsCount * 21; // 3 meals * 7 days
      });
      
      setWeeklyConsumption(consumption);
    } catch (error) {
      console.error('Error calculating consumption:', error);
    }
  };

  const calculatePredictedDays = (item) => {
    if (!item.consumption_per_student || studentsCount === 0) return 0;
    
    const dailyConsumption = item.consumption_per_student * studentsCount * 3;
    return dailyConsumption > 0 ? Math.floor(item.current_stock / dailyConsumption) : 0;
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      food_item: item.food_item,
      current_stock: item.current_stock,
      unit: item.unit,
      consumption_per_student: item.consumption_per_student,
      category: item.category,
      supplier: item.supplier || '',
      storage_condition: item.storage_condition,
      min_stock_level: item.min_stock_level || '',
      notification_emails: item.notification_emails ? item.notification_emails.join(', ') : ''
    });
  };

  const handleUpdate = async (itemId) => {
    try {
      const notificationEmails = editForm.notification_emails
        ? editForm.notification_emails.split(',').map(email => email.trim()).filter(email => email)
        : [];

      const { error } = await supabase
        .from('food_inventory')
        .update({
          food_item: editForm.food_item,
          current_stock: parseFloat(editForm.current_stock),
          unit: editForm.unit,
          consumption_per_student: parseFloat(editForm.consumption_per_student),
          category: editForm.category,
          supplier: editForm.supplier || null,
          min_stock_level: editForm.min_stock_level ? parseFloat(editForm.min_stock_level) : 0,
          storage_condition: editForm.storage_condition,
          notification_emails: notificationEmails,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      setEditingItem(null);
      fetchInventory();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item: ' + error.message);
    }
  };

  const handleStockUpdate = async (itemId, newStock) => {
    try {
      const { error } = await supabase
        .from('food_inventory')
        .update({ 
          current_stock: parseFloat(newStock),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      fetchInventory();
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'from-green-500 to-green-600', label: 'Active' },
      inactive: { color: 'from-gray-500 to-gray-600', label: 'Inactive' },
      depleted: { color: 'from-red-500 to-red-600', label: 'Depleted' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.color} shadow-lg`}>
        {config.label}
      </span>
    );
  };

  const getStockStatus = (item) => {
    const predictedDays = calculatePredictedDays(item);
    
    if (item.current_stock <= (item.min_stock_level || 0)) {
      return { 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        level: 'critical'
      };
    } else if (predictedDays <= 7) {
      return { 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        level: 'low'
      };
    } else if (predictedDays <= 14) {
      return { 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200',
        level: 'warning'
      };
    } else {
      return { 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        border: 'border-green-200',
        level: 'good'
      };
    }
  };

  const checkLowStockAlerts = () => {
    const lowStockItems = inventory.filter(item => 
      item.current_stock <= (item.min_stock_level || 0)
    );
    
    if (lowStockItems.length > 0) {
      // You can implement email notifications here
      console.log('Low stock items:', lowStockItems);
      // For now, we'll just show an alert
      if (lowStockItems.length === 1) {
        alert(`Low stock alert: ${lowStockItems[0].food_item} is below minimum level!`);
      } else {
        alert(`Low stock alert: ${lowStockItems.length} items are below minimum level!`);
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
            Inventory Management
          </h1>
          <p className="text-gray-600 text-lg">Manage all food items with consumption tracking</p>
          <div className="mt-4 bg-white rounded-lg p-4 shadow-md inline-block">
            <p className="text-sm text-gray-600">
              Total Students: <span className="font-bold text-blue-600">{studentsCount}</span> | 
              Active Items: <span className="font-bold text-green-600">{inventory.filter(i => i.status === 'active').length}</span>
            </p>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  fetchInventory();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="all">All Items</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="depleted">Depleted</option>
              </select>
              <span className="text-sm text-gray-600">
                {inventory.length} items found
              </span>
            </div>
            <div className="flex space-x-3">
              <motion.button
                onClick={checkLowStockAlerts}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                Check Alerts
              </motion.button>
              <motion.button
                onClick={fetchInventory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg transition-all duration-200"
              >
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {inventory.map((item) => {
                    const predictedDays = calculatePredictedDays(item);
                    const stockStatus = getStockStatus(item);
                    
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem === item.id ? (
                            <input
                              type="text"
                              name="food_item"
                              value={editForm.food_item}
                              onChange={(e) => setEditForm({...editForm, food_item: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all duration-200"
                            />
                          ) : (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{item.food_item}</div>
                              {item.supplier && (
                                <div className="text-xs text-gray-500">Supplier: {item.supplier}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem === item.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.01"
                                name="current_stock"
                                value={editForm.current_stock}
                                onChange={(e) => setEditForm({...editForm, current_stock: e.target.value})}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm transition-all duration-200"
                              />
                              <select
                                name="unit"
                                value={editForm.unit}
                                onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                                className="w-20 px-1 py-1 border border-gray-300 rounded-lg text-sm transition-all duration-200"
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="l">l</option>
                                <option value="ml">ml</option>
                                <option value="piece">piece</option>
                              </select>
                            </div>
                          ) : (
                            <div className={`text-sm font-bold ${stockStatus.color} px-3 py-1 rounded-lg ${stockStatus.bg} border ${stockStatus.border}`}>
                              {item.current_stock} {item.unit}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.min_stock_level || 0} {item.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            predictedDays <= 3 ? 'text-red-600' : 
                            predictedDays <= 7 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {predictedDays} days
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.consumption_per_student}{item.unit}/student
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem === item.id ? (
                            <select
                              name="category"
                              value={editForm.category}
                              onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm transition-all duration-200"
                            >
                              {categories.map(cat => (
                                <option key={cat.category_code} value={cat.category_code}>
                                  {cat.category_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-sm text-gray-500 capitalize">
                              {item.category}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingItem === item.id ? (
                            <div className="flex space-x-2">
                              <motion.button
                                onClick={() => handleUpdate(item.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingItem(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                <motion.button
                                  onClick={() => handleEdit(item)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors duration-200"
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  onClick={() => {
                                    const newStock = prompt(`Enter new stock for ${item.food_item} (${item.unit}):`, item.current_stock);
                                    if (newStock !== null) {
                                      handleStockUpdate(item.id, newStock);
                                    }
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-green-600 hover:text-green-800 text-xs font-semibold transition-colors duration-200"
                                >
                                  Update Stock
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {inventory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No inventory items found</p>
              <p className="text-gray-400">Add items to start tracking your inventory</p>
            </motion.div>
          )}
        </motion.div>

        {/* Stock Status Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Good (≥ 14 days)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Warning (7-14 days)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Low (3-7 days)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Critical (≤ 3 days)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;