// src/pages/store/StockRegister.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';

const StockRegister = () => {
  const [formData, setFormData] = useState({
    food_item: '',
    custom_food_item: '',
    quantity: '',
    unit: 'kg',
    consumption_per_student: '',
    category: 'grains',
    supplier: '',
    batch_number: '',
    storage_condition: 'room_temp',
    min_stock_level: '',
    notification_emails: ''
  });

  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [predictedDays, setPredictedDays] = useState(0);
  const [hasApprovalColumns, setHasApprovalColumns] = useState(true); // Assume approval columns exist

  // Ethiopian common food items by category
  const commonFoodItems = {
    grains: [
      'ሩዝ (Rice)', 'ፋስታ (Pasta)', 'ጤፍ (Teff)', 'ስንዴ (Wheat)', 
      'ዳጉሳ (Barley)', 'ባቄላ (Sorghum)', 'እንጀራ (Injera)', 'ዳቦ (Bread)'
    ],
    vegetables: [
      'ድንች (Potato)', 'ሽንኩርት (Onion)', 'ቲማቲም (Tomato)', 
      'ካሮት (Carrot)', 'ሙሉጌታ (Cabbage)', 'ነጭ ሽንኩርት (Garlic)',
      'ጅንጅብል (Ginger)', 'አደንድ (Green Pepper)', 'ሰላጣ (Lettuce)'
    ],
    proteins: [
      'ምስር ድፍን (Lentils)', 'ምስር ክክ (Chickpeas)', 'ሽሮ (Chickpeas)', 
      'በቀለ (Beans)', 'ወተት (Milk)', 'እንቁላል (Eggs)',
      'ዶሮ (Chicken)', 'በግ (Beef)', 'አሳ (Fish)'
    ],
    oils: [
      'ዘይት (Cooking Oil)', 'ቅቤ (Butter)', 'ነጭ ቅቤ (Ghee)'
    ],
    spices: [
      'ጨው (Salt)', 'ሰንዴ (Sugar)', 'በርበሬ (Pepper)', 
      'አይርስ (Turmeric)', 'ጨጓራ (Cumin)', 'ድምጥ (Coriander)'
    ],
    beverages: [
      'ቡና (Coffee)', 'ሻይ (Tea)', 'ሻይ ቅጠል (Tea Leaves)'
    ],
    other: [
      'ኤርድ (Yeast)', 'ማር (Honey)', 'ቃንድ (Vinegar)'
    ]
  };

  useEffect(() => {
    fetchRecentItems();
    fetchSuppliers();
    fetchCategories();
    fetchStudentsCount();
  }, []);

  useEffect(() => {
    calculatePredictedDays();
  }, [formData.quantity, formData.consumption_per_student, studentsCount]);

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

  const calculatePredictedDays = () => {
    if (!formData.quantity || !formData.consumption_per_student || studentsCount === 0) {
      setPredictedDays(0);
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const consumptionPerStudent = parseFloat(formData.consumption_per_student);
    const dailyConsumption = consumptionPerStudent * studentsCount * 3;
    
    if (dailyConsumption > 0) {
      const days = Math.floor(quantity / dailyConsumption);
      setPredictedDays(days);
    } else {
      setPredictedDays(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const foodItem = showCustomInput ? formData.custom_food_item : formData.food_item;
      
      if (!foodItem || !formData.quantity) {
        alert('Please fill in all required fields');
        return;
      }

      // Parse notification emails
      const notificationEmails = formData.notification_emails
        ? formData.notification_emails.split(',').map(email => email.trim()).filter(email => email)
        : [];

      // Base data without foreign key dependencies
      const baseData = {
        food_item: foodItem,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        consumption_per_student: parseFloat(formData.consumption_per_student) || 0.1,
        category: formData.category,
        supplier: formData.supplier || null,
        batch_number: formData.batch_number || null,
        storage_condition: formData.storage_condition,
        current_stock: parseFloat(formData.quantity),
        min_stock_level: formData.min_stock_level ? parseFloat(formData.min_stock_level) : parseFloat(formData.quantity) * 0.1,
        notification_emails: notificationEmails,
        status: 'active'
      };

      let insertData = baseData;

      // Try to add approval columns if they exist
      try {
        // First attempt with approval workflow
        const approvalData = {
          ...baseData,
          approved_by_committee: false,
          approved_by_president: false,
          registered_by: 'cafeteria_manager' // Simple string, no foreign key
        };

        const { data, error } = await supabase
          .from('food_inventory')
          .insert([approvalData])
          .select();

        if (error) {
          // If approval columns don't exist, fall back to base data
          if (error.code === '42703') {
            console.log('Approval columns not found, using basic insert');
            const { data: retryData, error: retryError } = await supabase
              .from('food_inventory')
              .insert([baseData])
              .select();

            if (retryError) throw retryError;
            
            alert('✅ Stock registered successfully!');
            setHasApprovalColumns(false);
          } else {
            throw error;
          }
        } else {
          alert('✅ Stock registered successfully! It has been sent to Cafeteria Committee for approval in the mobile app.');
        }
      } catch (error) {
        console.error('Error in approval workflow attempt:', error);
        
        // Final fallback - try basic insert
        const { data, error: finalError } = await supabase
          .from('food_inventory')
          .insert([baseData])
          .select();

        if (finalError) throw finalError;
        
        alert('✅ Stock registered successfully!');
        setHasApprovalColumns(false);
      }
      
      // Reset form
      setFormData({
        food_item: '',
        custom_food_item: '',
        quantity: '',
        unit: 'kg',
        consumption_per_student: '',
        category: 'grains',
        supplier: '',
        batch_number: '',
        storage_condition: 'room_temp',
        min_stock_level: '',
        notification_emails: ''
      });
      setShowCustomInput(false);
      
      // Refresh recent items
      fetchRecentItems();

    } catch (error) {
      console.error('Error registering stock:', error);
      
      // More specific error handling
      if (error.code === '23503') { // Foreign key violation
        alert('Error: Registration failed due to database constraint. Please check supplier information.');
      } else if (error.code === '42703') { // Column doesn't exist
        alert('Error: Database schema issue. Using basic registration mode.');
      } else if (error.message.includes('JWT')) {
        alert('Error: Authentication issue. Please refresh the page.');
      } else {
        alert('Error registering stock: ' + error.message);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Register New Stock
          </h1>
          <p className="text-gray-600 text-lg">Add food items to inventory with consumption tracking</p>
          
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-white rounded-xl p-4 max-w-md mx-auto shadow-md border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Registered by: Cafeteria Manager
                </p>
                <p className="text-xs text-gray-500">System Access: Inventory Management</p>
                <p className="text-xs text-green-600 font-medium">
                  {hasApprovalColumns ? '✓ Approval workflow enabled' : '⚠ Basic registration mode'}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </motion.div>
          
          {/* Approval Workflow Info */}
          {hasApprovalColumns && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <h3 className="font-semibold text-yellow-800">Approval Workflow Active</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-yellow-700">
                <div className="text-center">
                  <div className="font-semibold">Step 1</div>
                  <div>You Register (Web)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Step 2</div>
                  <div>Committee Reviews (Mobile)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Step 3</div>
                  <div>President Approves (Mobile)</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Form Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Food Item Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all duration-200"
                        >
                          {categories.map(cat => (
                            <option key={cat.category_code} value={cat.category_code}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Food Items Grid */}
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                        {getCategoryItems().map((item) => (
                          <motion.button
                            key={item}
                            type="button"
                            onClick={() => handleFoodItemSelect(item)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                              formData.food_item === item
                                ? 'bg-green-500 border-green-500 text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                            }`}
                          >
                            {item}
                          </motion.button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                      >
                        <span className="mr-1">+</span> Add custom food item
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <input
                        type="text"
                        name="custom_food_item"
                        value={formData.custom_food_item}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="Enter custom food item name"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="text-sm text-gray-600 hover:text-gray-800 mt-2 transition-colors duration-200"
                      >
                        ← Back to common items
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      placeholder="e.g., 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="l">Liter (l)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="piece">Piece</option>
                      <option value="sack">Sack</option>
                    </select>
                  </div>
                </div>

                {/* Consumption per Student */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    placeholder="e.g., 0.15"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount consumed by one student per meal
                  </p>
                </div>

                {/* Predicted Days Display */}
                <AnimatePresence>
                  {predictedDays > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Stock Prediction</p>
                          <p className="text-xs text-gray-600">
                            Based on {studentsCount} students × 3 meals/day
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            predictedDays <= 7 ? 'text-red-600' : 
                            predictedDays <= 14 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {predictedDays} days
                          </p>
                          <p className="text-xs text-gray-600">will last</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Additional Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supplier
                    </label>
                    <select
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      name="batch_number"
                      value={formData.batch_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      placeholder="Batch/Lot number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Storage Condition
                    </label>
                    <select
                      name="storage_condition"
                      value={formData.storage_condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <option value="room_temp">Room Temperature</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="frozen">Frozen</option>
                      <option value="dry">Dry Storage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Stock Level ({formData.unit})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="min_stock_level"
                      value={formData.min_stock_level}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                {/* Notification Emails */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notification Emails
                  </label>
                  <input
                    type="text"
                    name="notification_emails"
                    value={formData.notification_emails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    placeholder="email1@example.com, email2@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated emails for low stock alerts
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 font-semibold shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering Stock...
                    </div>
                  ) : (
                    `Register Stock ${hasApprovalColumns ? '(Approval Required)' : ''}`
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Information Panel */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Recent Items */}
            {recentItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Recently Added Items
                </h3>
                <div className="space-y-2">
                  {recentItems.map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-700">{item}</span>
                      <button
                        onClick={() => handleFoodItemSelect(item)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        Use
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Stock Registration Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Select from common Ethiopian items or add custom items
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
                {hasApprovalColumns && (
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Items require committee and president approval via mobile app
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Consumption Reference */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sample Consumption Rates (per student per meal)
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <div className="flex justify-between">
                  <span>Rice/Injera:</span>
                  <span>0.15 - 0.2 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Vegetables:</span>
                  <span>0.1 - 0.15 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooking Oil:</span>
                  <span>0.02 - 0.03 L</span>
                </div>
                <div className="flex justify-between">
                  <span>Meat/Fish:</span>
                  <span>0.08 - 0.12 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Lentils/Beans:</span>
                  <span>0.1 - 0.15 kg</span>
                </div>
              </div>
            </div>

            {/* Approval Status */}
            {hasApprovalColumns && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Approval Workflow Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Your Registration (Web)</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Committee Review (Mobile)</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">President Approval (Mobile)</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Waiting</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    After registration, committee members and presidents will review and approve via mobile app
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StockRegister;