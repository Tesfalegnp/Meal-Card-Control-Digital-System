import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabase_connect";
import { FaSearch, FaUser, FaIdCard, FaGraduationCap } from "react-icons/fa";

export default function CafeStudentsView() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
        gender: student.Gender
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

  // 🔍 Live Search
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(lowerSearch) ||
          s.universityId?.toLowerCase().includes(lowerSearch) ||
          s.department?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, students]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">👨‍🎓 Student Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View student information for meal management and verification
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 🔍 Search Bar */}
            <div className="flex-1 w-full">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, university ID, or department..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                           focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 
                           transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 📋 Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                         border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white truncate max-w-[150px]">
                          {student.fullName}
                        </h3>
                        <p className="text-green-100 text-sm">Student</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      student.status === 'Active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* University ID */}
                  <div className="flex items-center gap-3">
                    <FaIdCard className="text-green-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">University ID</p>
                      <p className="font-mono font-semibold text-gray-800">{student.universityId}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-3">
                    <FaGraduationCap className="text-green-600 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Department & Batch</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.department}
                        </span>
                        <span className="text-sm text-gray-700">Batch {student.batch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diet Type */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Diet Preference</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {student.dietType}
                    </span>
                  </div>

                  {/* Contact Info */}
                  {(student.email || student.phone) && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 mb-2">Contact Information</p>
                      <div className="space-y-1 text-sm">
                        {student.email && (
                          <p className="text-gray-700 truncate">📧 {student.email}</p>
                        )}
                        {student.phone && (
                          <p className="text-gray-700">📞 {student.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No students found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {search ? 'Try adjusting your search terms' : 'No students available in the system'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {filtered.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
              <div className="text-sm text-gray-600">Currently Viewing</div>
              <div className="text-2xl font-bold text-gray-800">{filtered.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
              <div className="text-sm text-gray-600">Active Students</div>
              <div className="text-2xl font-bold text-gray-800">
                {students.filter(s => s.status === 'Active').length}
              </div>
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