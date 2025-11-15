// src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase_connect";
import { FaQrcode, FaSearch, FaPlus, FaEye, FaUser, FaGraduationCap, FaPrint, FaTable, FaTh, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('first_name');

      if (error) throw error;
      
      // Format students for display
      const formattedStudents = data.map(student => ({
        id: student.id,
        student_id: student.student_id,
        fullName: `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim(),
        firstName: student.first_name,
        lastName: student.last_name,
        department: student.department,
        batch: student.year ? new Date(student.year).getFullYear().toString() : 'N/A',
        email: student.email,
        phone: student["phone-number"],
        status: student.status || 'active',
        registered_at: student.registered_at,
        qr_code: student.qr_code,
        gender: student.Gender,
        program: student.program
      }));

      setStudents(formattedStudents);
      setFiltered(formattedStudents);
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

  // 🔍 Advanced Filtering
  useEffect(() => {
    let filteredStudents = students;

    // Text search
    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(lowerSearch) ||
          s.student_id?.toLowerCase().includes(lowerSearch) ||
          s.department?.toLowerCase().includes(lowerSearch) ||
          s.email?.toLowerCase().includes(lowerSearch)
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      filteredStudents = filteredStudents.filter(s => 
        s.department?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filteredStudents = filteredStudents.filter(s => 
        s.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFiltered(filteredStudents);
  }, [search, students, selectedDepartment, selectedStatus]);

  // 👁️ View student details
  const handleViewStudent = (student) => {
    navigate(`/student-view/${student.student_id}`);
  };

  // 📄 Redirect to QR Print Page with single student
  const handleQrPrint = (student) => {
    navigate(`/qr-print?studentId=${student.student_id}`);
  };

  // ➕ Add new student
  const handleAddStudent = () => {
    navigate("/register");
  };

  // 📊 Quick stats
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    departments: [...new Set(students.map(s => s.department))].length,
    displayed: filtered.length
  };

  // Get unique departments for filter
  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-blue-800 font-semibold">Loading students...</p>
          <p className="text-blue-600 text-sm mt-2">Fetching student records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <FaUser className="text-xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">🎓 Student Management</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse student records, view detailed profiles, and generate QR codes for meal access
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaUser className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.departments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">🏫</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Displayed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.displayed}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaSearch className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              {/* 🔍 Search Bar */}
              <div className="relative flex-1 md:min-w-80">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, email, or department..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                           transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === "card" 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaTh />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                    viewMode === "table" 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaTable />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              {/* ➕ Add Student Button */}
              <button
                onClick={handleAddStudent}
                className="flex-1 lg:flex-none flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
                         px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <FaPlus className="text-white" />
                Add New Student
              </button>
            </div>
          </div>
        </div>

        {/* Students Display Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Student Records</h2>
              <span className="bg-white/20 text-white/90 px-3 py-1 rounded-full text-sm font-medium">
                {filtered.length} {filtered.length === 1 ? 'student' : 'students'} found
              </span>
            </div>
          </div>

          {/* Students Content */}
          <div className="p-6">
            {filtered.length > 0 ? (
              viewMode === "card" ? (
                <CardView 
                  students={filtered} 
                  onViewStudent={handleViewStudent}
                  onQrPrint={handleQrPrint}
                />
              ) : (
                <TableView 
                  students={filtered} 
                  onViewStudent={handleViewStudent}
                  onQrPrint={handleQrPrint}
                />
              )
            ) : (
              <NoResults 
                search={search}
                selectedDepartment={selectedDepartment}
                selectedStatus={selectedStatus}
                onClearFilters={() => {
                  setSearch("");
                  setSelectedDepartment("all");
                  setSelectedStatus("all");
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
              <p className="text-gray-600 text-sm">Manage your student database efficiently</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/qr-print')}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 
                         hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                <FaPrint />
                Bulk QR Print
              </button>
              <button
                onClick={handleAddStudent}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                         hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                <FaPlus />
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card View Component
const CardView = ({ students, onViewStudent, onQrPrint }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {students.map((student) => (
      <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
        {/* Student Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg truncate">{student.fullName}</h3>
              <p className="text-blue-100 text-sm">{student.department}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">
                {student.gender === 'Female' ? '👩' : '👨'}
              </span>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Student ID</span>
            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
              {student.student_id}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Batch</span>
            <span className="font-semibold text-gray-800">{student.batch}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              student.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : student.status === 'inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-xs text-gray-600 truncate max-w-[120px]">{student.email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-2">
            <button
              onClick={() => onViewStudent(student)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white 
                       px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group"
            >
              <FaEye className="text-sm" />
              <span className="text-sm font-medium">View</span>
            </button>
            <button
              onClick={() => onQrPrint(student)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white 
                       px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group"
            >
              <FaPrint className="text-sm" />
              <span className="text-sm font-medium">QR Code</span>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table View Component
const TableView = ({ students, onViewStudent, onQrPrint }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Student Information
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Academic Details
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {students.map((student, index) => (
          <tr 
            key={student.id} 
            className={`hover:bg-blue-50 transition-colors duration-150 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            {/* Student Information */}
            <td className="px-6 py-4">
              <div>
                <div 
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                  onClick={() => onViewStudent(student)}
                >
                  {student.fullName}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{student.student_id}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {student.email}
                </div>
              </div>
            </td>

            {/* Academic Details */}
            <td className="px-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {student.department}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Batch: <span className="font-semibold text-gray-800">{student.batch}</span>
                </div>
              </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                student.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : student.status === 'inactive'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
              </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
              <div className="flex justify-center gap-2">
                {/* View Button */}
                <button
                  onClick={() => onViewStudent(student)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white 
                           px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                           transform hover:scale-105 text-sm"
                  title="View Student"
                >
                  <FaEye className="text-sm" />
                  <span className="hidden sm:inline">View</span>
                </button>

                {/* QR Code Button */}
                <button
                  onClick={() => onQrPrint(student)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white 
                           px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                           transform hover:scale-105 text-sm"
                  title="Generate QR Code"
                >
                  <FaPrint className="text-sm" />
                  <span className="hidden sm:inline">QR Code</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// No Results Component
const NoResults = ({ search, selectedDepartment, selectedStatus, onClearFilters }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🔍</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      {search || selectedDepartment !== "all" || selectedStatus !== "all" 
        ? "No students found" 
        : "No students available"}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      {search || selectedDepartment !== "all" || selectedStatus !== "all" 
        ? "Try adjusting your search terms or filters" 
        : "Get started by adding your first student"}
    </p>
    {(search || selectedDepartment !== "all" || selectedStatus !== "all") && (
      <button
        onClick={onClearFilters}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Clear Filters
      </button>
    )}
  </div>
);