import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabase_connect";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaUser, FaIdCard, FaGraduationCap, FaEnvelope, FaPhone, FaUtensils, FaTable, FaTh } from "react-icons/fa";

export default function CafeStudentsView() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('first_name');

      if (error) throw error;

      // Transform data to match expected format
      const transformedStudents = data.map(student => ({
        id: student.id,
        universityId: student.student_id,
        fullName: `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim(),
        department: student.department,
        batch: student.year ? new Date(student.year).getFullYear() : 'N/A',
        dietType: student.diet_type || 'Not specified',
        status: student.status || 'Active',
        email: student.email,
        phone: student['phone - number'],
        gender: student.Gender,
        nationality: student.nationality,
        healthLevel: student['health - level']
      }));

      setStudents(transformedStudents);
      setFiltered(transformedStudents);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🔍 Live Search and Filter
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filteredStudents = students.filter(
      (s) =>
        (s.fullName?.toLowerCase().includes(lowerSearch) ||
         s.universityId?.toLowerCase().includes(lowerSearch) ||
         s.department?.toLowerCase().includes(lowerSearch) ||
         s.email?.toLowerCase().includes(lowerSearch)) &&
        (statusFilter === "all" || s.status === statusFilter)
    );
    setFiltered(filteredStudents);
  }, [search, students, statusFilter]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { color: 'from-green-500 to-green-600', label: 'Active' },
      Inactive: { color: 'from-gray-500 to-gray-600', label: 'Inactive' },
      Suspended: { color: 'from-red-500 to-red-600', label: 'Suspended' }
    };
    
    const config = statusConfig[status] || statusConfig.Active;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.color} shadow-lg`}>
        {config.label}
      </span>
    );
  };

  const getDietTypeColor = (dietType) => {
    const colors = {
      'Vegetarian': 'from-green-500 to-green-600',
      'Non-Vegetarian': 'from-red-500 to-red-600',
      'Vegan': 'from-emerald-500 to-emerald-600',
      'Gluten-Free': 'from-amber-500 to-amber-600',
      'Not specified': 'from-gray-500 to-gray-600'
    };
    return colors[dietType] || 'from-blue-500 to-blue-600';
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Student Directory
          </h1>
          <p className="text-gray-600 text-lg">View student information for meal management and verification</p>
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
                  placeholder="Search students by name, ID, department, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'table' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FaTable className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'card' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FaTh className="w-4 h-4" />
                  Cards
                </button>
              </div>
            </div>
            
            <motion.button
              onClick={fetchStudents}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 shadow-lg transition-all duration-200"
            >
              Refresh
            </motion.button>
          </div>
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
                <FaUser className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.status === 'Active').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FaUtensils className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Diet Types</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(students.map(s => s.dietType)).size}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(students.map(s => s.department)).size}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
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
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID & Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filtered.map((student) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg mr-3">
                              <FaUser className="text-sm" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{student.fullName}</div>
                              <div className="text-xs text-gray-500">
                                {student.gender || 'Not specified'} • {student.batch}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-bold text-gray-900">{student.universityId}</div>
                          <div className="text-xs text-gray-500">{student.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email || 'No email'}</div>
                          <div className="text-xs text-gray-500">{student.phone || 'No phone'}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(student.status)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">👨‍🎓</div>
                <p className="text-gray-500 text-lg">No students found</p>
                <p className="text-gray-400">
                  {search || statusFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "No students available in the system"
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Card View */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((student) => (
              <motion.div
                key={student.id}
                variants={itemVariants}
                layout
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:border-green-200 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FaUser className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
                        {student.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">{student.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                {/* Student ID */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-blue-500 text-lg" />
                  <div>
                    <p className="text-xs text-gray-600">Student ID</p>
                    <p className="font-mono font-bold text-gray-900">{student.universityId}</p>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <FaGraduationCap className="text-green-500 text-lg" />
                    <div>
                      <p className="text-xs text-gray-600">Department</p>
                      <p className="font-semibold text-gray-900">{student.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Batch</p>
                      <p className="font-semibold text-gray-900">{student.batch}</p>
                    </div>
                    {student.nationality && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Nationality</p>
                        <p className="font-semibold text-gray-900">{student.nationality}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Diet Type */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Diet Preference</p>
                      <p className="font-semibold text-gray-900">{student.dietType}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDietTypeColor(student.dietType)}`}>
                      <FaUtensils className="w-3 h-3 mr-1" />
                      Diet
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">CONTACT INFORMATION</p>
                  
                  {student.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FaEnvelope className="text-purple-500 w-4 h-4" />
                      <span className="text-gray-700 truncate">{student.email}</span>
                    </div>
                  )}
                  
                  {student.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <FaPhone className="text-green-500 w-4 h-4" />
                      <span className="text-gray-700">{student.phone}</span>
                    </div>
                  )}

                  {student.healthLevel && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">Health Note:</span> {student.healthLevel}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results for Card View */}
        {viewMode === 'card' && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="text-6xl mb-4">👨‍🎓</div>
            <p className="text-gray-500 text-lg mb-2">No students found</p>
            <p className="text-gray-400">
              {search || statusFilter !== "all" 
                ? "Try adjusting your search criteria" 
                : "No students available in the system"
              }
            </p>
          </motion.div>
        )}

        {/* Results Summary */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing {filtered.length} of {students.length} students
                  {search && ` for "${search}"`}
                  {statusFilter !== "all" && ` with status "${statusFilter}"`}
                  {` in ${viewMode} view`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}