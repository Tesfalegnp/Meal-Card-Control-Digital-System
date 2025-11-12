// src/pages/store/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

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
    unit_price: '',
    min_stock_level: '',
    storage_condition: 'room_temp'
  });
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('food_inventory')
        .select('*')
        .order('food_item');

      // Apply status filter
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

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      food_item: item.food_item,
      current_stock: item.current_stock,
      unit: item.unit,
      consumption_per_student: item.consumption_per_student,
      category: item.category,
      supplier: item.supplier || '',
      unit_price: item.unit_price || '',
      min_stock_level: item.min_stock_level || '',
      storage_condition: item.storage_condition
    });
  };

  const handleUpdate = async (itemId) => {
    try {
      const { error } = await supabase
        .from('food_inventory')
        .update({
          food_item: editForm.food_item,
          current_stock: parseFloat(editForm.current_stock),
          unit: editForm.unit,
          consumption_per_student: parseFloat(editForm.consumption_per_student),
          category: editForm.category,
          supplier: editForm.supplier || null,
          unit_price: editForm.unit_price ? parseFloat(editForm.unit_price) : null,
          min_stock_level: editForm.min_stock_level ? parseFloat(editForm.min_stock_level) : 0,
          storage_condition: editForm.storage_condition,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // If stock level changed, add a transaction record
      const originalItem = inventory.find(item => item.id === itemId);
      if (originalItem && originalItem.current_stock !== parseFloat(editForm.current_stock)) {
        const stockDifference = parseFloat(editForm.current_stock) - originalItem.current_stock;
        const { error: transactionError } = await supabase
          .from('stock_transactions')
          .insert([{
            food_item_id: itemId,
            transaction_type: stockDifference > 0 ? 'in' : 'out',
            quantity: Math.abs(stockDifference),
            unit_price: editForm.unit_price ? parseFloat(editForm.unit_price) : null,
            total_value: editForm.unit_price ? (parseFloat(editForm.unit_price) * Math.abs(stockDifference)) : null,
            notes: `Stock adjustment through inventory management`
          }]);

        if (transactionError) throw transactionError;
      }

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
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      depleted: { color: 'bg-red-100 text-red-800', label: 'Depleted' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStorageConditionLabel = (condition) => {
    const labels = {
      room_temp: 'Room Temperature',
      refrigerated: 'Refrigerated',
      frozen: 'Frozen',
      dry: 'Dry Storage'
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage all food items in your inventory</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  fetchInventory();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumption/Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          name="food_item"
                          value={editForm.food_item}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.food_item}</div>
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
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <select
                            name="unit"
                            value={editForm.unit}
                            onChange={handleInputChange}
                            className="w-20 px-1 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="l">l</option>
                            <option value="ml">ml</option>
                            <option value="piece">piece</option>
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.current_stock} {item.unit}
                          {item.unit_price && (
                            <div className="text-xs text-gray-500">
                              {item.unit_price} Birr/{item.unit}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          step="0.001"
                          name="consumption_per_student"
                          value={editForm.consumption_per_student}
                          onChange={handleInputChange}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.consumption_per_student} {item.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingItem === item.id ? (
                        <select
                          name="storage_condition"
                          value={editForm.storage_condition}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="room_temp">Room Temp</option>
                          <option value="refrigerated">Refrigerated</option>
                          <option value="frozen">Frozen</option>
                          <option value="dry">Dry Storage</option>
                        </select>
                      ) : (
                        getStorageConditionLabel(item.storage_condition)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          name="min_stock_level"
                          value={editForm.min_stock_level}
                          onChange={handleInputChange}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        item.min_stock_level || '0'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingItem === item.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            {item.status !== 'active' && (
                              <button
                                onClick={() => handleStatusChange(item.id, 'active')}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Activate
                              </button>
                            )}
                            {item.status !== 'inactive' && (
                              <button
                                onClick={() => handleStatusChange(item.id, 'inactive')}
                                className="text-yellow-600 hover:text-yellow-900 text-xs"
                              >
                                Deactivate
                              </button>
                            )}
                            {item.status !== 'depleted' && (
                              <button
                                onClick={() => handleStatusChange(item.id, 'depleted')}
                                className="text-red-600 hover:text-red-900 text-xs"
                              >
                                Mark Depleted
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;