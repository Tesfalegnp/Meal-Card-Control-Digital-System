// src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase_connect";
import { FaEdit, FaTrash, FaQrcode, FaSearch, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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
        qr_code: student.qr_code
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

  // 🔍 Live Search
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(lowerSearch) ||
          s.student_id?.toLowerCase().includes(lowerSearch) ||
          s.department?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, students]);

  // 🗑️ Delete student with confirmation
  const handleDelete = async (id, studentId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents((prev) => prev.filter((s) => s.id !== id));
      alert("Student deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete student: " + err.message);
    }
  };

  // ✏️ Update handler (redirect to update form page)
  const handleUpdate = (student) => {
    navigate(`/update-student/${student.id}`, { state: { student } });
  };

  // 📄 Redirect to QR Print Page
  const handleQrPrint = (student) => {
    navigate(`/qr-print`, { state: { student } });
  };

  // 👁️ View student details
  const handleViewStudent = (student) => {
    navigate(`/student-view/${student.student_id}`);
  };

  // ➕ Add new student
  const handleAddStudent = () => {
    navigate("/register");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">🎓 Students Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage student records, view details, and generate QR codes for meal access
          </p>
        </div>

        {/* Search and Add Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 🔍 Search Bar */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, or department..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                           transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            {/* ➕ Add Student Button */}
            <button
              onClick={handleAddStudent}
              className="w-full md:w-auto flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
                       px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FaPlus className="text-white" />
              Add New Student
            </button>
          </div>
        </div>

        {/* 📋 Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Student Records</h2>
              <span className="bg-white/20 text-white/90 px-3 py-1 rounded-full text-sm font-medium">
                {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Student Information
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Academic Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((student, index) => (
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
                            onClick={() => handleViewStudent(student)}
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
                            onClick={() => handleViewStudent(student)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white 
                                     px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105 text-sm"
                            title="View Student"
                          >
                            <span>👁️</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleUpdate(student)}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white 
                                     px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105 text-sm"
                            title="Edit Student"
                          >
                            <FaEdit className="text-sm" />
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => handleQrPrint(student)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white 
                                     px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105 text-sm"
                            title="Generate QR Code"
                          >
                            <FaQrcode className="text-sm" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(student.id, student.student_id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white 
                                     px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105 text-sm"
                            title="Delete Student"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No students found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          {search ? 'Try adjusting your search terms' : 'Get started by adding your first student'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        {filtered.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-2xl font-bold text-gray-800">
                {students.filter(s => s.status === 'active').length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
              <div className="text-sm text-gray-600">Displayed</div>
              <div className="text-2xl font-bold text-gray-800">{filtered.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
              <div className="text-sm text-gray-600">Search Results</div>
              <div className="text-2xl font-bold text-gray-800">
                {search ? `${filtered.length} found` : 'All students'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}