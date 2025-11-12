// src/pages/store/StockRegister.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';

const StockRegister = () => {
  const [formData, setFormData] = useState({
    food_item: '',
    custom_food_item: '',
    quantity: '',
    unit: 'kg',
    consumption_per_student: '',
    category: 'grains',
    supplier: '',
    unit_price: '',
    batch_number: '',
    storage_condition: 'room_temp',
    min_stock_level: ''
  });

  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Common food items by category
  const commonFoodItems = {
    grains: ['Rice', 'Wheat', 'Teff', 'Barley', 'Maize', 'Sorghum', 'Pasta', 'Bread', 'Injera'],
    vegetables: ['Onion', 'Potato', 'Tomato', 'Cabbage', 'Carrot', 'Garlic', 'Ginger', 'Green Pepper', 'Lettuce'],
    proteins: ['Beef', 'Chicken', 'Fish', 'Eggs', 'Lentils', 'Chickpeas', 'Beans', 'Split Peas'],
    oils: ['Cooking Oil', 'Butter', 'Palm Oil', 'Sunflower Oil', 'Olive Oil'],
    dairy: ['Milk', 'Yogurt', 'Cheese', 'Cream', 'Butter Milk'],
    fruits: ['Banana', 'Orange', 'Apple', 'Avocado', 'Mango', 'Pineapple'],
    spices: ['Salt', 'Sugar', 'Black Pepper', 'Turmeric', 'Berbere', 'Mitmita', 'Cumin', 'Coriander'],
    other: ['Coffee', 'Tea', 'Sugar', 'Honey', 'Vinegar', 'Soy Sauce']
  };

  useEffect(() => {
    fetchRecentItems();
    fetchSuppliers();
    fetchCategories();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_inventory')
        .select('food_item, created_at')
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        const uniqueItems = [...new Set(data.map(item => item.food_item))];
        setRecentItems(uniqueItems.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const foodItem = showCustomInput ? formData.custom_food_item : formData.food_item;
      
      if (!foodItem || !formData.quantity || !formData.consumption_per_student) {
        alert('Please fill in all required fields');
        return;
      }

      // Insert into food inventory
      const { data, error } = await supabase
        .from('food_inventory')
        .insert([{
          food_item: foodItem,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          consumption_per_student: parseFloat(formData.consumption_per_student),
          category: formData.category,
          supplier: formData.supplier || null,
          unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
          batch_number: formData.batch_number || null,
          storage_condition: formData.storage_condition,
          current_stock: parseFloat(formData.quantity),
          min_stock_level: formData.min_stock_level ? parseFloat(formData.min_stock_level) : 0,
          status: 'active'
        }])
        .select();

      if (error) throw error;

      // Add stock transaction
      const transactionData = {
        food_item_id: data[0].id,
        transaction_type: 'in',
        quantity: parseFloat(formData.quantity),
        notes: `Initial stock registration for ${foodItem}`
      };

      // Add optional fields if provided
      if (formData.unit_price) {
        transactionData.unit_price = parseFloat(formData.unit_price);
        transactionData.total_value = parseFloat(formData.unit_price) * parseFloat(formData.quantity);
      }
      
      if (formData.batch_number) {
        transactionData.batch_number = formData.batch_number;
      }

      const { error: transactionError } = await supabase
        .from('stock_transactions')
        .insert([transactionData]);

      if (transactionError) throw transactionError;

      alert('Stock registered successfully!');
      
      // Reset form
      setFormData({
        food_item: '',
        custom_food_item: '',
        quantity: '',
        unit: 'kg',
        consumption_per_student: '',
        category: 'grains',
        supplier: '',
        unit_price: '',
        batch_number: '',
        storage_condition: 'room_temp',
        min_stock_level: ''
      });
      setShowCustomInput(false);
      
      // Refresh recent items
      fetchRecentItems();

    } catch (error) {
      console.error('Error registering stock:', error);
      alert('Error registering stock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set category based on food item selection
    if (name === 'food_item' && value) {
      const category = Object.keys(commonFoodItems).find(cat => 
        commonFoodItems[cat].includes(value)
      );
      if (category) {
        setFormData(prev => ({ ...prev, category }));
      }
    }
  };

  const handleFoodItemSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      food_item: item,
      custom_food_item: ''
    }));
    setShowCustomInput(false);
  };

  const getCategoryItems = () => {
    return commonFoodItems[formData.category] || [];
  };

  const calculateTotalValue = () => {
    if (formData.quantity && formData.unit_price) {
      return (parseFloat(formData.quantity) * parseFloat(formData.unit_price)).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Stock</h1>
          <p className="text-gray-600">Add food items to the inventory with consumption details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Item Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Item *
                  </label>
                  
                  {!showCustomInput ? (
                    <div className="space-y-3">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat.category_code} value={cat.category_code}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Food Items Grid */}
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                        {getCategoryItems().map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleFoodItemSelect(item)}
                            className={`p-2 text-xs rounded border transition-colors ${
                              formData.food_item === item
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        + Add custom food item
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        name="custom_food_item"
                        value={formData.custom_food_item}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter custom food item name"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="text-sm text-gray-600 hover:text-gray-800 mt-2"
                      >
                        ← Back to common items
                      </button>
                    </div>
                  )}
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
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
                      <option value="ml">Milliliter (ml)</option>
                      <option value="piece">Piece</option>
                      <option value="dozen">Dozen</option>
                      <option value="bag">Bag</option>
                      <option value="sack">Sack</option>
                      <option value="bottle">Bottle</option>
                      <option value="can">Can</option>
                    </select>
                  </div>
                </div>

                {/* Consumption per Student */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumption per Student ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="consumption_per_student"
                    value={formData.consumption_per_student}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 0.15"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount consumed by one student per meal
                  </p>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <select
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price (Birr)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 85.50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      name="batch_number"
                      value={formData.batch_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Batch/Lot number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Condition
                    </label>
                    <select
                      name="storage_condition"
                      value={formData.storage_condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="room_temp">Room Temperature</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="frozen">Frozen</option>
                      <option value="dry">Dry Storage</option>
                    </select>
                  </div>
                </div>

                {/* Minimum Stock Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock Level ({formData.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="min_stock_level"
                    value={formData.min_stock_level}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when stock falls below this level
                  </p>
                </div>

                {/* Total Value Display */}
                {formData.unit_price && formData.quantity && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Total Value: {calculateTotalValue()} Birr
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Registering Stock...' : 'Register Stock'}
                </button>
              </form>
            </div>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Recent Items */}
            {recentItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Items</h3>
                <div className="space-y-2">
                  {recentItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-700">{item}</span>
                      <button
                        onClick={() => handleFoodItemSelect(item)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Stock Registration Guidelines</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Select from common items or add custom items
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Enter accurate consumption per student for better planning
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Include supplier info for traceability
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Set proper storage conditions for food safety
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Use batch numbers for inventory tracking
                </li>
              </ul>
            </div>

            {/* Quick Consumption Reference */}
            <div className="bg-green-50 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Consumption Rates</h3>
              <div className="text-sm text-green-700 space-y-1">
                <div className="flex justify-between">
                  <span>Rice/Injera:</span>
                  <span>0.15 - 0.2 kg/student</span>
                </div>
                <div className="flex justify-between">
                  <span>Vegetables:</span>
                  <span>0.1 - 0.15 kg/student</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooking Oil:</span>
                  <span>0.02 - 0.03 L/student</span>
                </div>
                <div className="flex justify-between">
                  <span>Meat/Fish:</span>
                  <span>0.08 - 0.12 kg/student</span>
                </div>
                <div className="flex justify-between">
                  <span>Lentils/Beans:</span>
                  <span>0.08 - 0.1 kg/student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRegister;