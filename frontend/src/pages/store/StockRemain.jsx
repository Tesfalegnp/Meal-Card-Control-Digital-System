// src/pages/store/StockRemain.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

const StockRemain = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });
      
      if (studentsError) throw studentsError;
      setStudentsCount(studentsData?.length || 0);

      // Fetch inventory with filtering
      let query = supabase
        .from('food_inventory')
        .select('*')
        .order('food_item');

      if (filter !== 'all') {
        if (filter === 'low') {
          query = query.lte('current_stock', supabase.raw('min_stock_level'));
        } else if (filter === 'critical') {
          query = query.lte('current_stock', supabase.raw('min_stock_level * 0.5'));
        }
      }

      const { data: inventoryData, error: inventoryError } = await query;

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictedDays = (item) => {
    if (!item.consumption_per_student || studentsCount === 0) return 0;
    
    const dailyConsumption = item.consumption_per_student * studentsCount * 3; // 3 meals per day
    return dailyConsumption > 0 ? Math.floor(item.current_stock / dailyConsumption) : 0;
  };

  const getStockStatus = (item) => {
    const predictedDays = calculatePredictedDays(item);
    
    if (item.current_stock <= (item.min_stock_level || 0)) {
      return { level: 'critical', text: 'CRITICAL', color: 'bg-red-50 border-red-200', badge: 'text-red-600 bg-red-100' };
    } else if (item.current_stock <= (item.min_stock_level || 0) * 2) {
      return { level: 'low', text: 'LOW', color: 'bg-yellow-50 border-yellow-200', badge: 'text-yellow-600 bg-yellow-100' };
    } else if (predictedDays <= 7) {
      return { level: 'warning', text: 'WATCH', color: 'bg-orange-50 border-orange-200', badge: 'text-orange-600 bg-orange-100' };
    } else {
      return { level: 'good', text: 'GOOD', color: 'bg-green-50 border-green-200', badge: 'text-green-600 bg-green-100' };
    }
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => {
      if (item.unit_price && item.current_stock) {
        return total + (item.unit_price * item.current_stock);
      }
      return total;
    }, 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => 
      item.current_stock <= (item.min_stock_level || 0)
    ).length;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Remaining Stock Analysis</h1>
          <p className="text-gray-600">Current inventory status and consumption predictions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{getLowStockItems()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{studentsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalInventoryValue().toFixed(2)} Birr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Items</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical Stock</option>
              </select>
              <span className="text-sm text-gray-600">
                Showing {inventory.length} items
              </span>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const predictedDays = calculatePredictedDays(item);
            const status = getStockStatus(item);
            
            return (
              <div
                key={item.id}
                className={`border rounded-lg p-6 ${status.color}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.food_item}</h3>
                    <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-xl font-bold text-gray-900">
                      {item.current_stock} {item.unit}
                    </p>
                    {item.min_stock_level > 0 && (
                      <p className="text-xs text-gray-500">
                        Min: {item.min_stock_level} {item.unit}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Daily Consumption</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.consumption_per_student * studentsCount * 3} {item.unit}/day
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Predicted Days</p>
                      <p className={`text-lg font-semibold ${
                        predictedDays <= 3 ? 'text-red-600' : 
                        predictedDays <= 7 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {predictedDays} days
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Unit Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {item.unit_price ? `${item.unit_price} Birr` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Storage</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {item.storage_condition.replace('_', ' ')}
                    </p>
                  </div>

                  {item.supplier && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-600">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">{item.supplier}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {inventory.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No inventory items found</p>
            <p className="text-gray-400 mt-2">Register new stock to see analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockRemain;