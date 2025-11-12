// src/pages/store/StockRegister.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

const StockRegister = () => {
  const [formData, setFormData] = useState({
    food_item: '',
    quantity: '',
    unit: 'kg',
    consumption_per_student: '',
    meal_type: 'lunch',
    max_storage_days: ''
  });
  const [loading, setLoading] = useState(false);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    fetchStudentsCount();
  }, []);

  const fetchStudentsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });
      
      if (error) throw error;
      setStudentsCount(data.length);
    } catch (error) {
      console.error('Error fetching students count:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(formData.max_storage_days));

      // Insert into food inventory
      const { data, error } = await supabase
        .from('food_inventory')
        .insert([{
          ...formData,
          quantity: parseFloat(formData.quantity),
          consumption_per_student: parseFloat(formData.consumption_per_student),
          expiry_date: expiryDate.toISOString().split('T')[0]
        }]);

      if (error) throw error;

      // Add stock transaction
      await supabase
        .from('stock_transactions')
        .insert([{
          food_item_id: data[0].id,
          transaction_type: 'in',
          quantity: parseFloat(formData.quantity),
          notes: `Initial stock registration for ${formData.food_item}`
        }]);

      alert('Stock registered successfully!');
      setFormData({
        food_item: '',
        quantity: '',
        unit: 'kg',
        consumption_per_student: '',
        meal_type: 'lunch',
        max_storage_days: ''
      });

    } catch (error) {
      console.error('Error registering stock:', error);
      alert('Error registering stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictedDays = () => {
    if (!formData.quantity || !formData.consumption_per_student || studentsCount === 0) {
      return 0;
    }
    
    const totalQuantity = parseFloat(formData.quantity);
    const consumptionPerStudent = parseFloat(formData.consumption_per_student);
    const dailyConsumption = consumptionPerStudent * studentsCount * 3; // 3 meals per day
    
    return dailyConsumption > 0 ? Math.floor(totalQuantity / dailyConsumption) : 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Stock</h1>
          <p className="text-gray-600">Add new food items to the inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food Item Name
                    </label>
                    <input
                      type="text"
                      name="food_item"
                      value={formData.food_item}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Onion, Rice, Chicken"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="l">Liter (l)</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consumption per Student ({formData.unit})
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      name="consumption_per_student"
                      value={formData.consumption_per_student}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      name="meal_type"
                      value={formData.meal_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Storage Days
                    </label>
                    <input
                      type="number"
                      name="max_storage_days"
                      value={formData.max_storage_days}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Stock'}
                </button>
              </form>
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Prediction</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-blue-900">{studentsCount}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Daily Consumption</p>
                  <p className="text-xl font-bold text-green-900">
                    {formData.quantity && formData.consumption_per_student ? 
                      (parseFloat(formData.consumption_per_student) * studentsCount * 3).toFixed(2) 
                      : '0'} {formData.unit}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    (3 meals per day for all students)
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Predicted Days to Finish</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {calculatePredictedDays()} days
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Storage Limit</p>
                  <p className="text-xl font-bold text-purple-900">
                    {formData.max_storage_days || '0'} days
                  </p>
                </div>

                {formData.max_storage_days && calculatePredictedDays() > parseInt(formData.max_storage_days) && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium">⚠️ Warning</p>
                    <p className="text-xs text-red-600 mt-1">
                      Stock will expire before being fully consumed. Consider reducing quantity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRegister;