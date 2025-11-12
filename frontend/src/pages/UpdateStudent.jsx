// src/pages/UpdateStudent.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase_connect";

export default function UpdateStudent() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        let studentData;
        
        // If student data is passed via state, use it
        if (state?.student) {
          studentData = state.student;
        } 
        // Otherwise fetch from Supabase using the ID from URL
        else if (id) {
          const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          studentData = data;
        }

        if (studentData) {
          setForm({
            firstName: studentData.first_name || '',
            middleName: studentData.middle_name || '',
            lastName: studentData.last_name || '',
            gender: studentData.Gender || '',
            email: studentData.email || '',
            phoneNumber: studentData["phone-number"] || '',
            department: studentData.department || '',
            batch: studentData.year ? new Date(studentData.year).getFullYear().toString() : '',
            universityId: studentData.student_id || '',
            status: studentData.status || 'active'
          });
        } else {
          alert("No student data found!");
          navigate("/students");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        alert("Failed to load student data");
        navigate("/students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [state, id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for Supabase update
      const updateData = {
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        Gender: form.gender,
        email: form.email,
        "phone-number": form.phoneNumber,
        department: form.department,
        year: form.batch ? new Date(`${form.batch}-01-01`).toISOString() : null,
        status: form.status,
        student_id: form.universityId
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('student_id', form.universityId);

      if (error) throw error;

      alert("Student updated successfully!");
      navigate("/students");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update student: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">✏️ Update Student</h2>
          <p className="text-gray-600">Update student information in the system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName || ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={form.middleName || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName || ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={form.department || ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch
              </label>
              <input
                type="number"
                name="batch"
                value={form.batch || ""}
                onChange={handleChange}
                placeholder="e.g., 2024"
                min="2000"
                max="2030"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University ID *
              </label>
              <input
                type="text"
                name="universityId"
                value={form.universityId || ""}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                readOnly
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status || "active"}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}