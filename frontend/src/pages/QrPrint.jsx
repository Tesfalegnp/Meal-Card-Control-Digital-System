// src/pages/QrPrint.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaPrint, FaDownload, FaQrcode, FaUsers, FaCheckCircle, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

const QrPrint = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('student_id, first_name, middle_name, last_name, department, year, qr_code, status')
        .order('first_name');

      if (error) throw error;
      
      // Generate QR codes for students who don't have them
      const studentsWithQR = data.map(student => ({
        ...student,
        qr_code: student.qr_code || generateQRCode(student.student_id, student.first_name, student.last_name)
      }));
      
      setStudents(studentsWithQR || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (studentId, firstName, lastName) => {
    const qrData = JSON.stringify({
      studentId: studentId,
      name: `${firstName} ${lastName}`,
      type: "meal_card",
      timestamp: new Date().toISOString()
    });
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allStudentIds = new Set(filteredStudents.map(student => student.student_id));
      setSelectedStudents(allStudentIds);
    }
  };

  const handlePrint = () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student to print');
      return;
    }
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 1000);
    }, 500);
  };

  const handleExportList = () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student to export');
      return;
    }

    const selectedData = students.filter(student => 
      selectedStudents.has(student.student_id)
    ).map(student => ({
      'Student ID': student.student_id,
      'Name': `${student.first_name} ${student.last_name}`,
      'Department': student.department,
      'Batch': student.year ? new Date(student.year).getFullYear() : 'N/A',
      'QR Code URL': student.qr_code
    }));

    const csvContent = [
      Object.keys(selectedData[0]).join(','),
      ...selectedData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr_codes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  const batches = [...new Set(students.map(s => s.year ? new Date(s.year).getFullYear() : null).filter(Boolean))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
    const matchesBatch = batchFilter === 'all' || 
      (student.year && new Date(student.year).getFullYear().toString() === batchFilter);
    
    return matchesSearch && matchesDepartment && matchesBatch;
  });

  const studentsToPrint = filteredStudents.filter(student => 
    selectedStudents.has(student.student_id)
  );

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive' }
    }[status] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            QR Code Management
          </h1>
          <p className="text-gray-600 text-lg">Generate and print QR codes for student meal cards</p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <motion.button
                onClick={handleSelectAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaUsers />
                {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </motion.button>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={handlePrint}
                  disabled={selectedStudents.size === 0}
                  whileHover={{ scale: selectedStudents.size > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: selectedStudents.size > 0 ? 0.95 : 1 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <FaPrint />
                  Print Selected ({selectedStudents.size})
                </motion.button>

                <motion.button
                  onClick={handleExportList}
                  disabled={selectedStudents.size === 0}
                  whileHover={{ scale: selectedStudents.size > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: selectedStudents.size > 0 ? 0.95 : 1 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <FaDownload />
                  Export List
                </motion.button>
              </div>
            </div>

            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filters:</span>
            </div>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Batches</option>
              {batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Student Selection Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaQrcode />
                Student Selection ({filteredStudents.length} students found)
              </h2>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className="text-sm text-gray-600">
                  Selected: {selectedStudents.size}
                </span>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FaCheckCircle />
                  Ready to print
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    QR Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredStudents.map((student) => (
                    <motion.tr
                      key={student.student_id}
                      variants={itemVariants}
                      layout
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.student_id)}
                          onChange={() => handleCheckboxChange(student.student_id)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 font-mono">
                          {student.student_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.middle_name} {student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.year ? new Date(student.year).getFullYear() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          student.qr_code 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {student.qr_code ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Available
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="mr-1" />
                              Missing
                            </>
                          )}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-blue-500 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Students Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || departmentFilter !== 'all' || batchFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No students available in the system'
                }
              </p>
              {(searchTerm || departmentFilter !== 'all' || batchFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                    setBatchFilter('all');
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Printable QR Codes */}
        <div className={`print:block ${printMode ? 'block' : 'hidden'}`}>
          {studentsToPrint.map((student, index) => (
            <div key={student.student_id} className="break-after-page mb-8 print:mb-0">
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 border-2 border-blue-200 rounded-2xl print:border-none print:shadow-none max-w-md mx-auto shadow-lg">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaQrcode className="text-white text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Card</h2>
                  <p className="text-gray-600 font-semibold">Mekelle University</p>
                </div>

                {/* Student Info */}
                <div className="text-center mb-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {student.first_name} {student.last_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-mono font-semibold">ID: {student.student_id}</p>
                    <p>Department: {student.department}</p>
                    {student.year && (
                      <p>Batch: {new Date(student.year).getFullYear()}</p>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="border-4 border-blue-300 p-4 rounded-2xl bg-white shadow-inner">
                    <img 
                      src={student.qr_code} 
                      alt={`QR Code for ${student.first_name} ${student.last_name}`}
                      className="w-64 h-64 mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = generateQRCode(student.student_id, student.first_name, student.last_name);
                      }}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center text-sm text-gray-600 mt-4 space-y-1">
                  <p className="font-semibold">Present this card at the cafeteria for meal scanning</p>
                  <p>Valid for current academic year</p>
                  <p className="text-xs text-gray-500 mt-2">Keep this card safe and do not share</p>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-300">
                  <p>Printed on: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block,
            .print\\:block * {
              visibility: visible;
            }
            .print\\:block {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .break-after-page {
              break-after: page;
            }
            .print\\:mb-0 {
              margin-bottom: 0 !important;
            }
            .print\\:border-none {
              border: none !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default QrPrint;