// src/pages/DenyManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';

const DenyManagement = () => {
  const [students, setStudents] = useState([]);
  const [activeDenials, setActiveDenials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [denialReasons, setDenialReasons] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Deny form state
  const [denyForm, setDenyForm] = useState({
    meal_types: [],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: 'fasting',
    custom_reason: ''
  });

  useEffect(() => {
    fetchData();
    // Set up automatic refresh every 30 seconds to check for expired denials
    const interval = setInterval(() => {
      fetchActiveDenials();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchActiveDenials(),
        fetchDenialReasons()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id, first_name, last_name, department, year')
        .order('first_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchActiveDenials = async () => {
    try {
      const { data, error } = await supabase
        .from('active_denials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveDenials(data || []);
    } catch (error) {
      console.error('Error fetching active denials:', error);
    }
  };

  const fetchDenialReasons = async () => {
    try {
      const { data, error } = await supabase
        .from('denial_reasons')
        .select('*')
        .eq('is_active', true)
        .order('reason_text');

      if (error) throw error;
      
      // Add fasting as a default reason if not exists
      const defaultReasons = [
        { reason_code: 'fasting', reason_text: 'Fasting', description: 'Student is fasting' },
        ...(data || [])
      ];
      setDenialReasons(defaultReasons);
    } catch (error) {
      console.error('Error fetching denial reasons:', error);
      // Set default reasons if table doesn't exist
      setDenialReasons([
        { reason_code: 'fasting', reason_text: 'Fasting', description: 'Student is fasting' },
        { reason_code: 'fee_not_paid', reason_text: 'Fee Not Paid', description: 'Student has not paid cafeteria fees' },
        { reason_code: 'disciplinary', reason_text: 'Disciplinary Action', description: 'Temporary suspension due to disciplinary reasons' },
        { reason_code: 'other', reason_text: 'Other Reason', description: 'Other unspecified reasons' }
      ]);
    }
  };

  const handleMealTypeToggle = (mealType) => {
    setDenyForm(prev => {
      const currentMealTypes = [...prev.meal_types];
      if (currentMealTypes.includes(mealType)) {
        return {
          ...prev,
          meal_types: currentMealTypes.filter(m => m !== mealType)
        };
      } else {
        return {
          ...prev,
          meal_types: [...currentMealTypes, mealType]
        };
      }
    });
  };

  const openDenyForm = (student) => {
    setSelectedStudent(student);
    setDenyForm({
      meal_types: ['breakfast', 'lunch', 'dinner'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      reason: 'fasting',
      custom_reason: ''
    });
    setShowDenyForm(true);
  };

  const closeDenyForm = () => {
    setShowDenyForm(false);
    setSelectedStudent(null);
    setDenyForm({
      meal_types: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      reason: 'fasting',
      custom_reason: ''
    });
  };

  const handleDenyStudent = async () => {
    if (!selectedStudent) return;
    if (denyForm.meal_types.length === 0) {
      alert('Please select at least one meal type');
      return;
    }
    if (!denyForm.reason) {
      alert('Please select a reason');
      return;
    }

    setActionLoading(true);
    try {
      const reasonText = denyForm.reason === 'other' 
        ? denyForm.custom_reason 
        : denialReasons.find(r => r.reason_code === denyForm.reason)?.reason_text || denyForm.reason;

      const { error } = await supabase
        .from('denied_students')
        .insert([{
          student_id: selectedStudent.student_id,
          meal_types: denyForm.meal_types,
          start_date: denyForm.start_date,
          end_date: denyForm.end_date || null,
          reason: reasonText,
          is_active: true
        }]);

      if (error) throw error;

      alert('Student access denied successfully!');
      closeDenyForm();
      fetchActiveDenials(); // Refresh the active denials list
    } catch (error) {
      console.error('Error denying student access:', error);
      alert('Error denying student access: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDenial = async (denialId) => {
    if (!confirm('Are you sure you want to remove this denial and restore student access?')) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('denied_students')
        .update({ is_active: false })
        .eq('id', denialId);

      if (error) throw error;

      alert('Student access restored successfully!');
      fetchActiveDenials(); // Refresh the active denials list
    } catch (error) {
      console.error('Error removing denial:', error);
      alert('Error removing denial: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRemove = async (denialIds) => {
    if (!confirm(`Are you sure you want to remove ${denialIds.length} denials and restore access?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('denied_students')
        .update({ is_active: false })
        .in('id', denialIds);

      if (error) throw error;

      alert(`${denialIds.length} denials removed successfully!`);
      fetchActiveDenials();
    } catch (error) {
      console.error('Error bulk removing denials:', error);
      alert('Error bulk removing denials: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getMealTypeBadges = (mealTypes) => {
    const mealLabels = {
      breakfast: '🍳 Breakfast',
      lunch: '🍽️ Lunch',
      dinner: '🌙 Dinner'
    };

    return mealTypes.map(mealType => (
      <span
        key={mealType}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
      >
        {mealLabels[mealType] || mealType}
      </span>
    ));
  };

  const getStatusBadge = (denial) => {
    const today = new Date().toISOString().split('T')[0];
    const startDate = denial.start_date;
    const endDate = denial.end_date;

    if (!denial.is_active) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }

    if (today < startDate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Scheduled</span>;
    }

    if (endDate && today > endDate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }

    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 'No end date';
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  };

  // Filter students for the list
  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter active denials for expired ones that can be auto-removed
  const expiredDenials = activeDenials.filter(denial => {
    const today = new Date().toISOString().split('T')[0];
    return denial.end_date && today > denial.end_date;
  });

  // Auto-remove expired denials
  useEffect(() => {
    if (expiredDenials.length > 0) {
      const expiredIds = expiredDenials.map(d => d.id);
      handleBulkRemove(expiredIds);
    }
  }, [activeDenials.length]); // Run when activeDenials changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Access Management</h1>
              <p className="text-gray-600">
                Manage student access to cafeteria meals. Deny access for specific periods and meal types.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={fetchData}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Students List Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                    Students ({filteredStudents.length})
                  </h2>
                  <div className="flex-1 sm:max-w-xs">
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-96">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No students found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const isDenied = activeDenials.some(denial => 
                        denial.student_id === student.student_id && denial.is_currently_active
                      );
                      
                      return (
                        <div key={student.student_id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {student.first_name} {student.last_name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {student.student_id} • {student.department}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isDenied && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Denied
                                    </span>
                                  )}
                                  <button
                                    onClick={() => openDenyForm(student)}
                                    disabled={isDenied || actionLoading}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Deny Access
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Denials Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Active Denials ({activeDenials.length})
                  </h2>
                  {activeDenials.length > 0 && (
                    <button
                      onClick={() => {
                        const activeIds = activeDenials.map(d => d.id);
                        handleBulkRemove(activeIds);
                      }}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-96">
                {activeDenials.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active denials</p>
                    <p className="text-sm text-gray-400 mt-1">All students have access to meals</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {activeDenials.map((denial) => (
                      <div key={denial.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {denial.first_name} {denial.last_name}
                              </h3>
                              {getStatusBadge(denial)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {denial.student_id} • {denial.department}
                            </p>
                            
                            <div className="mb-2">
                              <p className="text-xs text-gray-600 mb-1">Denied Meals:</p>
                              <div className="flex flex-wrap">
                                {getMealTypeBadges(denial.meal_types)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                              <div>
                                <span className="font-medium">Start:</span> {new Date(denial.start_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">End:</span> {denial.end_date ? new Date(denial.end_date).toLocaleDateString() : 'No end date'}
                              </div>
                            </div>

                            {denial.end_date && (
                              <div className="mb-2">
                                <span className={`text-xs font-medium ${
                                  getDaysRemaining(denial.end_date).includes('Expired') 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                  {getDaysRemaining(denial.end_date)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Reason: {denial.reason}
                              </span>
                              <button
                                onClick={() => handleRemoveDenial(denial.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Restore Access
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Denials</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeDenials.filter(d => d.is_currently_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeDenials.filter(d => {
                    const today = new Date().toISOString().split('T')[0];
                    return d.start_date > today;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Access Granted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {students.length - activeDenials.filter(d => d.is_currently_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deny Access Modal */}
      {showDenyForm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Deny Access for {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <button
                  onClick={closeDenyForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Meal Types Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Types to Deny *
                  </label>
                  <div className="space-y-2">
                    {['breakfast', 'lunch', 'dinner'].map(mealType => (
                      <label key={mealType} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={denyForm.meal_types.includes(mealType)}
                          onChange={() => handleMealTypeToggle(mealType)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {mealType} {mealType === 'breakfast' ? '🍳' : mealType === 'lunch' ? '🍽️' : '🌙'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={denyForm.start_date}
                      onChange={(e) => setDenyForm(prev => ({ ...prev, start_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={denyForm.end_date}
                      onChange={(e) => setDenyForm(prev => ({ ...prev, end_date: e.target.value }))}
                      min={denyForm.start_date}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Denial *
                  </label>
                  <select
                    value={denyForm.reason}
                    onChange={(e) => setDenyForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {denialReasons.map(reason => (
                      <option key={reason.reason_code} value={reason.reason_code}>
                        {reason.reason_text}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Reason */}
                {denyForm.reason === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Reason *
                    </label>
                    <input
                      type="text"
                      value={denyForm.custom_reason}
                      onChange={(e) => setDenyForm(prev => ({ ...prev, custom_reason: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter the reason for denial"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeDenyForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDenyStudent}
                    disabled={actionLoading || denyForm.meal_types.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {actionLoading ? 'Denying...' : 'Deny Access'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DenyManagement;