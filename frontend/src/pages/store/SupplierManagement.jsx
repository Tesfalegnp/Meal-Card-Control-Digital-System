// src/pages/store/SupplierManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaStar, FaSearch, FaFilter, FaPlus, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaBuilding } from 'react-icons/fa';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    topRated: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    items_supplied: '',
    payment_terms: 'Net 30 days',
    rating: 3
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [suppliers]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.is_active).length;
    const inactive = suppliers.filter(s => !s.is_active).length;
    const topRated = suppliers.filter(s => s.rating >= 4).length;

    setStats({ total, active, inactive, topRated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsArray = formData.items_supplied.split(',').map(item => item.trim()).filter(item => item);

      const supplierData = {
        ...formData,
        items_supplied: itemsArray,
        rating: parseInt(formData.rating),
        is_active: true
      };

      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData]);

        if (error) throw error;
      }

      resetForm();
      fetchSuppliers();
      
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier: ' + error.message);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier.id);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      items_supplied: supplier.items_supplied ? supplier.items_supplied.join(', ') : '',
      payment_terms: supplier.payment_terms || 'Net 30 days',
      rating: supplier.rating || 3
    });
    setShowForm(true);
  };

  const handleStatusChange = async (supplierId, isActive) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: isActive })
        .eq('id', supplierId);

      if (error) throw error;

      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier status:', error);
      alert('Error updating supplier status: ' + error.message);
    }
  };

  const handleDelete = async (supplierId) => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return;

    try {
      const supplierName = suppliers.find(s => s.id === supplierId)?.name;
      
      const { data: inventoryItems, error: checkError } = await supabase
        .from('food_inventory')
        .select('id')
        .eq('supplier', supplierName)
        .limit(1);

      if (checkError) throw checkError;

      if (inventoryItems && inventoryItems.length > 0) {
        alert('Cannot delete supplier. There are inventory items associated with this supplier.');
        return;
      }

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Error deleting supplier: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      items_supplied: '',
      payment_terms: 'Net 30 days',
      rating: 3
    });
    setEditingSupplier(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
        Inactive
      </span>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && supplier.is_active) ||
                         (statusFilter === 'inactive' && !supplier.is_active);
    
    const matchesRating = ratingFilter === 'all' || 
                         supplier.rating.toString() === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

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
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Supplier Management
          </h1>
          <p className="text-gray-600 text-lg">Manage your food suppliers and track their performance</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FaBuilding className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FaToggleOn className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                <FaToggleOff className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                <FaStar className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Rated</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.topRated}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
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
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                onClick={fetchSuppliers}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaFilter />
                Refresh
              </motion.button>
              <motion.button
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaPlus />
                Add Supplier
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Add/Edit Supplier Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Supplier Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter supplier name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Person
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          placeholder="Contact person name"
                        />
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          placeholder="Phone number"
                        />
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          placeholder="Email address"
                        />
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Full address"
                        />
                        <FaMapMarkerAlt className="absolute left-3 top-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Items Supplied (comma separated) *
                      </label>
                      <input
                        type="text"
                        name="items_supplied"
                        value={formData.items_supplied}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Onion, Rice, Chicken, Vegetables"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Terms
                      </label>
                      <select
                        name="payment_terms"
                        value={formData.payment_terms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Net 15 days">Net 15 days</option>
                        <option value="Net 30 days">Net 30 days</option>
                        <option value="Net 45 days">Net 45 days</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rating
                      </label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="1">1 Star - Poor</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="3">3 Stars - Good</option>
                        <option value="4">4 Stars - Very Good</option>
                        <option value="5">5 Stars - Excellent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-semibold"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg"
                    >
                      {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suppliers Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSuppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              variants={itemVariants}
              layout
              whileHover={{ y: -5 }}
              className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 ${
                supplier.is_active ? 'border-green-200' : 'border-red-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(supplier.is_active)}
                    {getRatingStars(supplier.rating)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-4">
                {supplier.contact_person && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUser className="w-4 h-4 mr-3 text-blue-500" />
                    <span>{supplier.contact_person}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="w-4 h-4 mr-3 text-green-500" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 mr-3 text-purple-500" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
              </div>

              {/* Items Supplied */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Items Supplied:</h4>
                <div className="flex flex-wrap gap-1">
                  {supplier.items_supplied ? (
                    supplier.items_supplied.slice(0, 4).map((item, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No items specified</span>
                  )}
                  {supplier.items_supplied && supplier.items_supplied.length > 4 && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{supplier.items_supplied.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Payment:</span> {supplier.payment_terms}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEdit(supplier)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    title="Edit Supplier"
                  >
                    <FaEdit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleStatusChange(supplier.id, !supplier.is_active)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      supplier.is_active
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    title={supplier.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {supplier.is_active ? <FaToggleOff className="w-4 h-4" /> : <FaToggleOn className="w-4 h-4" />}
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => handleDelete(supplier.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  title="Delete Supplier"
                >
                  <FaTrash className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredSuppliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-500 text-lg mb-2">No suppliers found</p>
            <p className="text-gray-400 mb-4">Try adjusting your search or add a new supplier</p>
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              Add Your First Supplier
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupplierManagement;