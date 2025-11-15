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

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchStudentsCount();
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

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const { error } = await supabase
        .from('food_inventory')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      fetchInventory();
      alert(`Item status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('food_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      fetchInventory();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (predictedDays <= 7) {
      return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
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
          <p className="text-gray-600 text-lg">Manage all food items in your inventory</p>
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
            <motion.button
              onClick={fetchInventory}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 shadow-lg transition-all duration-200"
            >
              Refresh
            </motion.button>
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
                              onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm transition-all duration-200"
                              />
                              <select
                                name="unit"
                                value={editForm.unit}
                                onChange={handleInputChange}
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
                          <div className={`text-sm font-bold ${
                            predictedDays <= 3 ? 'text-red-600' : 
                            predictedDays <= 7 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {predictedDays} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem === item.id ? (
                            <select
                              name="category"
                              value={editForm.category}
                              onChange={handleInputChange}
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
                                  onClick={() => handleDelete(item.id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="text-red-600 hover:text-red-800 text-xs font-semibold transition-colors duration-200"
                                >
                                  Delete
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
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryManagement;