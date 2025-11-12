// src/pages/store/InventoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    food_item: '',
    quantity: '',
    consumption_per_student: '',
    max_storage_days: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .order('food_item');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      food_item: item.food_item,
      quantity: item.quantity,
      consumption_per_student: item.consumption_per_student,
      max_storage_days: item.max_storage_days
    });
  };

  const handleUpdate = async (itemId) => {
    try {
      const { error } = await supabase
        .from('food_inventory')
        .update({
          food_item: editForm.food_item,
          quantity: parseFloat(editForm.quantity),
          consumption_per_student: parseFloat(editForm.consumption_per_student),
          max_storage_days: parseInt(editForm.max_storage_days)
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

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('food_inventory')
        .update({ status: 'inactive' })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage all food items in your inventory</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Food Inventory ({inventory.length} items)
              </h2>
              <button
                onClick={fetchInventory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Food Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consumption/Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Storage Days
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
                        <div className="text-sm font-medium text-gray-900">{item.food_item}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleInputChange}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.quantity} {item.unit}
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
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.consumption_per_student} {item.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item.meal_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          name="max_storage_days"
                          value={editForm.max_storage_days}
                          onChange={handleInputChange}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{item.max_storage_days} days</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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