// src/pages/store/StockRemain.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

const StockRemain = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });
      
      if (studentsError) throw studentsError;
      setStudentsCount(studentsData.length);

      // Fetch inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('food_inventory')
        .select('*')
        .eq('status', 'active')
        .order('food_item');

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictedDays = (item) => {
    const dailyConsumption = item.consumption_per_student * studentsCount * 3;
    return dailyConsumption > 0 ? Math.floor(item.quantity / dailyConsumption) : 0;
  };

  const getStatusColor = (item) => {
    const predictedDays = calculatePredictedDays(item);
    
    if (predictedDays <= 2) return 'bg-red-50 border-red-200';
    if (predictedDays <= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getUrgencyText = (item) => {
    const predictedDays = calculatePredictedDays(item);
    const daysUntilExpiry = Math.floor((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (predictedDays <= 2 || daysUntilExpiry <= 2) return 'CRITICAL';
    if (predictedDays <= 5 || daysUntilExpiry <= 5) return 'URGENT';
    return 'STABLE';
  };

  const getUrgencyColor = (item) => {
    const urgency = getUrgencyText(item);
    if (urgency === 'CRITICAL') return 'text-red-600 bg-red-100';
    if (urgency === 'URGENT') return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Remaining Stock</h1>
          <p className="text-gray-600">
            Current inventory status and consumption predictions
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
            <p className="text-sm text-blue-600">
              Total Students: <span className="font-semibold">{studentsCount}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const predictedDays = calculatePredictedDays(item);
            const daysUntilExpiry = Math.floor((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={item.id}
                className={`border rounded-lg p-6 ${getStatusColor(item)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.food_item}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item)}`}>
                    {getUrgencyText(item)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Current Quantity</p>
                    <p className="text-xl font-bold text-gray-900">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Daily Consumption</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(item.consumption_per_student * studentsCount * 3).toFixed(2)} {item.unit}/day
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Predicted Days</p>
                      <p className={`text-lg font-semibold ${
                        predictedDays <= 2 ? 'text-red-600' : 
                        predictedDays <= 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {predictedDays} days
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Expires In</p>
                      <p className={`text-lg font-semibold ${
                        daysUntilExpiry <= 2 ? 'text-red-600' : 
                        daysUntilExpiry <= 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {daysUntilExpiry} days
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Meal Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{item.meal_type}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {inventory.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No active inventory items found</p>
            <p className="text-gray-400 mt-2">Register new stock to see predictions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockRemain;