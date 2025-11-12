// src/pages/Register.jsx
import React, { useState } from "react";
import { supabase } from "../services/supabase_connect";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    email: "",
    phoneNumber: "",
    department: "",
    batch: "",
    universityId: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generate QR code data - you can use a QR code generation service or library
  const generateQRCode = (studentId, firstName, lastName) => {
    // Using a simple QR code generation service
    // You can replace this with your preferred QR code generator
    const qrData = JSON.stringify({
      studentId: studentId,
      name: `${firstName} ${lastName}`,
      type: "meal_card",
      timestamp: new Date().toISOString()
    });
    
    // Using QR Server API to generate QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generate QR code for the student
      const qrCodeUrl = generateQRCode(
        form.universityId, 
        form.firstName, 
        form.lastName
      );

      // Insert student data into Supabase
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            student_id: form.universityId,
            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,
            department: form.department,
            year: form.batch ? new Date(form.batch).toISOString() : null,
            email: form.email,
            "Gender": form.gender,
            "phone-number": form.phoneNumber,
            qr_code: qrCodeUrl,
            status: 'active',
            registered_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        
        // Check if it's a duplicate student ID error
        if (error.code === '23505') {
          throw new Error('Student ID already exists');
        }
        throw error;
      }

      alert("Student registered successfully with QR code!");
      
      // Clear form
      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        email: "",
        phoneNumber: "",
        department: "",
        batch: "",
        universityId: ""
      });

    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Register Student
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                required
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                placeholder="Middle Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                required
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                required
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <input
                type="number"
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="e.g., 2024"
                min="2000"
                max="2030"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University ID *
              </label>
              <input
                required
                name="universityId"
                value={form.universityId}
                onChange={handleChange}
                placeholder="University ID"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register Student"
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>QR code will be automatically generated and stored for the student</p>
        </div>
      </div>
    </div>
  );
}