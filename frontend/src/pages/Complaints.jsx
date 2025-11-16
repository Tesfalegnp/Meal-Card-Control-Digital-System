// src/pages/Complaints.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaExclamationTriangle, FaCheckCircle, FaClock, FaReply, FaEye, FaChartBar } from 'react-icons/fa';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    urgent: 0
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [complaints]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students (
            first_name,
            last_name,
            student_id,
            department,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const urgent = complaints.filter(c => c.priority === 'high').length;
    
    setStats({ total, pending, resolved, urgent });
  };

  const handleResponse = async (complaintId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setResponding(complaintId);
      
      const { error } = await supabase
        .from('complaints')
        .update({
          response: responseText,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          responded_by: 'Admin' // You can replace this with actual user info
        })
        .eq('id', complaintId);

      if (error) throw error;

      setResponseText('');
      setResponding(null);
      fetchComplaints();
      
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error sending response: ' + error.message);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId);

      if (error) throw error;

      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'from-yellow-500 to-orange-500', 
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        label: 'Pending',
        icon: FaClock
      },
      in_progress: { 
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        label: 'In Progress',
        icon: FaEye
      },
      resolved: { 
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        label: 'Resolved',
        icon: FaCheckCircle
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.textColor} border`}>
        <IconComponent className="text-xs" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'text-green-600 bg-green-100', label: 'Low' },
      medium: { color: 'text-yellow-600 bg-yellow-100', label: 'Medium' },
      high: { color: 'text-red-600 bg-red-100', label: 'High' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.students?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.students?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Complaints Management
          </h1>
          <p className="text-gray-600 text-lg">Manage and respond to student feedback and concerns</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FaChartBar className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-yellow-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <FaClock className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-red-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search complaints, students, or messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <motion.button
              onClick={fetchComplaints}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <FaFilter />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Complaints List */}
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {filteredComplaints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-12 text-center border border-blue-100"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Complaints Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No complaints have been submitted yet'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              filteredComplaints.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  variants={itemVariants}
                  layout
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {complaint.students?.first_name?.[0]}{complaint.students?.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {complaint.students?.first_name} {complaint.students?.last_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {complaint.students?.student_id}
                            </span>
                            <span>•</span>
                            <span>{complaint.students?.department}</span>
                            {complaint.students?.email && (
                              <>
                                <span>•</span>
                                <span>{complaint.students?.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(complaint.priority || 'medium')}
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(complaint.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Complaint Message */}
                    <div className="mb-6">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {complaint.message}
                        </p>
                      </div>
                    </div>

                    {/* Response Section */}
                    {complaint.response ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-green-800 flex items-center gap-2">
                            <FaCheckCircle />
                            Response Sent
                          </span>
                          <span className="text-xs text-green-600">
                            {new Date(complaint.resolved_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-green-700 bg-white/50 p-3 rounded-lg border border-green-300">
                          {complaint.response}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Status Update Buttons */}
                        <div className="flex gap-2">
                          {['pending', 'in_progress', 'resolved'].map(status => (
                            <motion.button
                              key={status}
                              onClick={() => handleStatusUpdate(complaint.id, status)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                complaint.status === status
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {status === 'pending' ? 'Mark Pending' : 
                               status === 'in_progress' ? 'In Progress' : 'Mark Resolved'}
                            </motion.button>
                          ))}
                        </div>

                        {/* Response Input */}
                        <div>
                          <textarea
                            value={responding === complaint.id ? responseText : ''}
                            onChange={(e) => setResponseText(e.target.value)}
                            onFocus={() => setResponding(complaint.id)}
                            placeholder="Type your response to the student..."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          />
                          {responding === complaint.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex justify-end space-x-3 mt-3"
                            >
                              <button
                                onClick={() => {
                                  setResponding(null);
                                  setResponseText('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                              >
                                Cancel
                              </button>
                              <motion.button
                                onClick={() => handleResponse(complaint.id)}
                                disabled={!responseText.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 flex items-center gap-2"
                              >
                                <FaReply />
                                Send Response
                              </motion.button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Complaints;