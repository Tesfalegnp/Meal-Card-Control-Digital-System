// src/pages/store/SupplierView.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaSearch, FaFilter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaBuilding, FaFileAlt } from 'react-icons/fa';

const SupplierView = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    topRated: 0
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
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.items_supplied?.some(item => 
                           item.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
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
            Supplier Directory
          </h1>
          <p className="text-gray-600 text-lg">View all food suppliers and their information</p>
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
                <div className="w-5 h-5 bg-white rounded-full mr-0"></div>
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
                <div className="w-5 h-5 bg-white rounded-full mr-0"></div>
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
                  placeholder="Search suppliers by name, contact, email, or items..."
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

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ${
                      viewMode === 'table' 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={fetchSuppliers}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FaFilter />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Suppliers Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
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
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-200 cursor-pointer ${
                  supplier.is_active ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'
                }`}
                onClick={() => setSelectedSupplier(supplier)}
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
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Payment Terms:</span> {supplier.payment_terms}
                  </p>
                </div>

                {/* View Details Hint */}
                <div className="mt-4 text-center">
                  <span className="text-xs text-green-600 font-medium">Click to view details</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Table View */
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
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Items Supplied
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredSuppliers.map((supplier) => (
                      <motion.tr
                        key={supplier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{supplier.name}</div>
                          <div className="text-xs text-gray-500">{supplier.payment_terms}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{supplier.contact_person || '-'}</div>
                          <div className="text-xs text-gray-500">{supplier.phone || '-'}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{supplier.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {supplier.items_supplied ? (
                              supplier.items_supplied.slice(0, 3).map((item, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                            {supplier.items_supplied && supplier.items_supplied.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{supplier.items_supplied.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRatingStars(supplier.rating)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(supplier.is_active)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredSuppliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-500 text-lg mb-2">No suppliers found</p>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </motion.div>
        )}

        {/* Supplier Detail Modal */}
        <AnimatePresence>
          {selectedSupplier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedSupplier(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                        <FaBuilding className="text-white text-xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(selectedSupplier.is_active)}
                          {getRatingStars(selectedSupplier.rating)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSupplier(null)}
                      className="text-gray-500 hover:text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSupplier.contact_person && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                          <p className="text-gray-900 font-medium">{selectedSupplier.contact_person}</p>
                        </div>
                      )}
                      {selectedSupplier.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <div className="flex items-center text-gray-900">
                            <FaPhone className="w-4 h-4 mr-2 text-green-500" />
                            {selectedSupplier.phone}
                          </div>
                        </div>
                      )}
                      {selectedSupplier.email && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="flex items-center text-gray-900">
                            <FaEnvelope className="w-4 h-4 mr-2 text-purple-500" />
                            {selectedSupplier.email}
                          </div>
                        </div>
                      )}
                      {selectedSupplier.address && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <div className="flex items-start text-gray-900">
                            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500 mt-1 flex-shrink-0" />
                            <span>{selectedSupplier.address}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Supplied */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FaFileAlt className="text-green-500" />
                      Items Supplied
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.items_supplied ? (
                        selectedSupplier.items_supplied.map((item, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm px-3 py-2 rounded-lg font-medium shadow-sm"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No items specified</span>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Payment Terms:</span> {selectedSupplier.payment_terms}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupplierView;