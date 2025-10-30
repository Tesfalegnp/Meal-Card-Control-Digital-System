// meal-card-system/frontend/src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
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
      const res = await api.get("/students");
      if (res.data.success) {
        setStudents(res.data.students);
        setFiltered(res.data.students);
      }
    } catch (err) {
      console.error(err);
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
          s.universityId?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, students]);

  // 🗑️ Delete student with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this student?")) return;

    try {
      const res = await api.delete(`/students/${id}`);
      if (res.data.success) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        alert("Student deleted successfully!");
      } else {
        alert(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  };

  // ✏️ Update handler (redirect to update form page)
  const handleUpdate = (student) => {
    navigate(`/update-student/${student.id}`, { state: { student } });
  };

  // 📄 Redirect to QR Print Page
  const handleQrPrint = (student) => {
    navigate(`/qr-print/${student.id}`, { state: { student } });
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
                  placeholder="Search by name or university ID..."
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
                          <div className="text-lg font-semibold text-gray-900">
                            {student.fullName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{student.universityId}</span>
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

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleUpdate(student)}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white 
                                     px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105"
                            title="Edit Student"
                          >
                            <FaEdit className="text-sm" />
                            <span className="text-sm font-medium">Edit</span>
                          </button>

                          {/* QR Code Button */}
                          <button
                            onClick={() => handleQrPrint(student)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white 
                                     px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105"
                            title="Generate QR Code"
                          >
                            <FaQrcode className="text-sm" />
                            <span className="text-sm font-medium">QR</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white 
                                     px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                     transform hover:scale-105"
                            title="Delete Student"
                          >
                            <FaTrash className="text-sm" />
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="text-sm text-gray-600">Displayed</div>
              <div className="text-2xl font-bold text-gray-800">{filtered.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
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