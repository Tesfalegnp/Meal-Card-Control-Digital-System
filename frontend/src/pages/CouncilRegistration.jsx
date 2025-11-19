// src/pages/CouncilRegistration.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';

const CouncilRegistration = () => {
  const [studentId, setStudentId] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [councilMembers, setCouncilMembers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    working_type: '',
    position: '',
    academic_year: new Date().getFullYear().toString(),
    responsibilities: [],
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  // Council position options
  const workingTypes = {
    president: ['President'],
    vice_president: ['Vice President'],
    cafeteria: [
      'Cafeteria President',
      'Security Head',
      'Finance Head',
      'Store Manager',
      'Health & Safety Officer',
      'Menu Coordinator',
      'Quality Control Officer'
    ],
    other: ['Secretary', 'Treasurer', 'Event Coordinator', 'Public Relations Officer']
  };

  const responsibilityOptions = {
    president: ['Overall Management', 'Meeting Coordination', 'Decision Making', 'Representation'],
    vice_president: ['Assist President', 'Act as President when absent', 'Committee Coordination'],
    cafeteria_president: ['Cafeteria Oversight', 'Staff Coordination', 'Menu Planning', 'Budget Management'],
    security_head: ['Security Management', 'Access Control', 'Incident Handling', 'Safety Protocols'],
    finance_head: ['Budget Planning', 'Expense Tracking', 'Financial Reporting', 'Fund Management'],
    store_manager: ['Inventory Management', 'Stock Tracking', 'Supplier Coordination', 'Storage Management'],
    health_safety_officer: ['Hygiene Monitoring', 'Health Standards', 'Safety Compliance', 'Quality Checks'],
    menu_coordinator: ['Menu Planning', 'Recipe Management', 'Nutrition Planning', 'Special Diets'],
    quality_control_officer: ['Food Quality', 'Service Standards', 'Feedback Collection', 'Improvement Plans'],
    secretary: ['Documentation', 'Record Keeping', 'Communication', 'Meeting Minutes'],
    treasurer: ['Financial Records', 'Expense Approval', 'Budget Monitoring', 'Financial Reports'],
    event_coordinator: ['Event Planning', 'Logistics', 'Coordination', 'Promotion'],
    public_relations_officer: ['Communication', 'Publicity', 'Relationship Management', 'Announcements']
  };

  useEffect(() => {
    fetchCouncilMembers();
    fetchAllStudents();
  }, []);

  const fetchCouncilMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('council_members')
        .select(`
          *,
          students (
            student_id,
            first_name,
            middle_name,
            last_name,
            department,
            email
          )
        `)
        .eq('is_active', true)
        .order('working_type')
        .order('position');

      if (!error && data) {
        setCouncilMembers(data);
      }
    } catch (error) {
      console.error('Error fetching council members:', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('student_id, first_name, middle_name, last_name, department, email, status')
        .eq('status', 'active')
        .order('first_name');

      if (!error && data) {
        setAllStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const searchStudent = async () => {
    if (!studentId.trim()) {
      alert('Please enter a student ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          alert('Student not found. Please check the student ID.');
        } else {
          throw error;
        }
        setSearchedStudent(null);
        return;
      }

      // Check if student is already in council for current academic year
      const { data: existingMember } = await supabase
        .from('council_members')
        .select('*')
        .eq('student_id', studentId.trim())
        .eq('academic_year', formData.academic_year)
        .eq('is_active', true)
        .single();

      if (existingMember) {
        alert(`This student is already registered as ${existingMember.position} in the council for ${formData.academic_year}`);
        setSearchedStudent(null);
        return;
      }

      setSearchedStudent(data);
      setShowForm(true);
      
    } catch (error) {
      console.error('Error searching student:', error);
      alert('Error searching student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchedStudent) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('council_members')
        .insert([{
          student_id: searchedStudent.student_id,
          working_type: formData.working_type,
          position: formData.position,
          academic_year: formData.academic_year,
          responsibilities: formData.responsibilities,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: true
        }]);

      if (error) throw error;

      alert('Student successfully registered as council member!');
      
      // Reset form
      setStudentId('');
      setSearchedStudent(null);
      setShowForm(false);
      setFormData({
        working_type: '',
        position: '',
        academic_year: new Date().getFullYear().toString(),
        responsibilities: [],
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });

      // Refresh data
      fetchCouncilMembers();
      
    } catch (error) {
      console.error('Error registering council member:', error);
      alert('Error registering council member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingTypeChange = (e) => {
    const newWorkingType = e.target.value;
    setFormData({
      ...formData,
      working_type: newWorkingType,
      position: '', // Reset position when working type changes
      responsibilities: [] // Reset responsibilities
    });
  };

  const handlePositionChange = (e) => {
    const newPosition = e.target.value;
    setFormData({
      ...formData,
      position: newPosition,
      responsibilities: responsibilityOptions[newPosition.toLowerCase().replace(/ /g, '_')] || []
    });
  };

  const handleResponsibilityToggle = (responsibility) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.includes(responsibility)
        ? prev.responsibilities.filter(r => r !== responsibility)
        : [...prev.responsibilities, responsibility]
    }));
  };

  const getPositionOptions = () => {
    return workingTypes[formData.working_type] || [];
  };

  const deactivateMember = async (memberId) => {
    if (!confirm('Are you sure you want to deactivate this council member?')) return;

    try {
      const { error } = await supabase
        .from('council_members')
        .update({ 
          is_active: false,
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', memberId);

      if (error) throw error;

      alert('Council member deactivated successfully!');
      fetchCouncilMembers();
    } catch (error) {
      console.error('Error deactivating member:', error);
      alert('Error deactivating member: ' + error.message);
    }
  };

  const getWorkingTypeColor = (workingType) => {
    const colors = {
      president: 'from-red-500 to-red-600',
      vice_president: 'from-orange-500 to-orange-600',
      cafeteria: 'from-green-500 to-green-600',
      other: 'from-blue-500 to-blue-600'
    };
    return colors[workingType] || 'from-gray-500 to-gray-600';
  };

  const getWorkingTypeLabel = (workingType) => {
    const labels = {
      president: 'Student President',
      vice_president: 'Vice President',
      cafeteria: 'Cafeteria Committee',
      other: 'Other Positions'
    };
    return labels[workingType] || workingType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Council Registration
          </h1>
          <p className="text-gray-600 text-lg">Register and manage student council members</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Registration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Student Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Register New Council Member</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter student ID..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
                    />
                    <motion.button
                      onClick={searchStudent}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </div>
                      ) : (
                        'Search Student'
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Student Info Card */}
                <AnimatePresence>
                  {searchedStudent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                    >
                      <h3 className="font-semibold text-green-800 mb-2">Student Found</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-semibold">
                            {searchedStudent.first_name} {searchedStudent.middle_name} {searchedStudent.last_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Department:</span>
                          <p className="font-semibold">{searchedStudent.department}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Student ID:</span>
                          <p className="font-semibold">{searchedStudent.student_id}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-semibold">{searchedStudent.email}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Council Registration Form */}
            <AnimatePresence>
              {showForm && searchedStudent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Council Position Details</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Working Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Working Type *
                      </label>
                      <select
                        value={formData.working_type}
                        onChange={handleWorkingTypeChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Working Type</option>
                        <option value="president">Student President</option>
                        <option value="vice_president">Vice President</option>
                        <option value="cafeteria">Cafeteria Committee</option>
                        <option value="other">Other Positions</option>
                      </select>
                    </div>

                    {/* Position */}
                    {formData.working_type && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <select
                          value={formData.position}
                          onChange={handlePositionChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select Position</option>
                          {getPositionOptions().map(position => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Academic Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        value={formData.academic_year}
                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 2024"
                      />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Responsibilities */}
                    {formData.position && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Responsibilities
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-xl bg-gray-50">
                          {responsibilityOptions[formData.position.toLowerCase().replace(/ /g, '_')]?.map(responsibility => (
                            <label key={responsibility} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={formData.responsibilities.includes(responsibility)}
                                onChange={() => handleResponsibilityToggle(responsibility)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">{responsibility}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 font-semibold shadow-lg transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Registering...
                        </div>
                      ) : (
                        'Register as Council Member'
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column - Current Council Members */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Current Council Members */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Council Members</h2>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                  {councilMembers.length} members
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {councilMembers.length > 0 ? (
                  councilMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl border-l-4 bg-gradient-to-r from-white to-gray-50 ${
                        member.working_type === 'president' ? 'border-l-red-500' :
                        member.working_type === 'vice_president' ? 'border-l-orange-500' :
                        member.working_type === 'cafeteria' ? 'border-l-green-500' :
                        'border-l-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getWorkingTypeColor(member.working_type)} text-white`}>
                              {getWorkingTypeLabel(member.working_type)}
                            </span>
                            <span className="text-sm text-gray-500">{member.academic_year}</span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {member.students?.first_name} {member.students?.last_name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-1">
                            {member.position}
                          </p>
                          
                          <p className="text-sm text-gray-500">
                            {member.students?.student_id} • {member.students?.department}
                          </p>

                          {member.responsibilities && member.responsibilities.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 mb-1">Responsibilities:</p>
                              <div className="flex flex-wrap gap-1">
                                {member.responsibilities.slice(0, 3).map((resp, index) => (
                                  <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {resp}
                                  </span>
                                ))}
                                {member.responsibilities.length > 3 && (
                                  <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                                    +{member.responsibilities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => deactivateMember(member.id)}
                          className="ml-4 text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Deactivate Member"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg">No council members registered</p>
                    <p className="text-gray-400">Register students to see them here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Council Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {councilMembers.filter(m => m.working_type === 'president').length}
                  </p>
                  <p className="text-sm text-red-700">President</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">
                    {councilMembers.filter(m => m.working_type === 'vice_president').length}
                  </p>
                  <p className="text-sm text-orange-700">Vice President</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {councilMembers.filter(m => m.working_type === 'cafeteria').length}
                  </p>
                  <p className="text-sm text-green-700">Cafeteria</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {councilMembers.filter(m => m.working_type === 'other').length}
                  </p>
                  <p className="text-sm text-blue-700">Other</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CouncilRegistration;