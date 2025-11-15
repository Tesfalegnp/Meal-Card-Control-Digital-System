// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase_connect";
import Papa from "papaparse";
import { 
  FaUserGraduate, 
  FaUpload, 
  FaCheck, 
  FaSpinner, 
  FaFileCsv, 
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaCalendarAlt,
  FaUniversity,
  FaGraduationCap,
  FaShieldAlt,
  FaQrcode,
  FaKey,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function Register() {
  // -------------------------- STATE --------------------------
  const [activeTab, setActiveTab] = useState("manual");
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
  const [csvData, setCsvData] = useState([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // -------------------------- SUCCESS POPUP --------------------------
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // -------------------------- PASSWORD GENERATION --------------------------
  const generatePassword = (lastName) => {
    const basePassword = "123";
    if (lastName && lastName.trim() !== "") {
      return basePassword + lastName.trim();
    }
    return basePassword;
  };

  // Update generated password when last name changes
  useEffect(() => {
    const password = generatePassword(form.lastName);
    setGeneratedPassword(password);
  }, [form.lastName]);

  // -------------------------- QR GENERATION --------------------------
  const generateQRCode = (studentId, firstName, lastName) => {
    const qrData = JSON.stringify({
      studentId,
      name: `${firstName} ${lastName}`,
      type: "meal_card",
      timestamp: new Date().toISOString()
    });

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  // -------------------------- INPUT CHANGE --------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------------------- MANUAL SUBMIT --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnimationKey(prev => prev + 1);

    try {
      const qrCodeUrl = generateQRCode(
        form.universityId,
        form.firstName,
        form.lastName
      );

      // Generate password
      const password = generatePassword(form.lastName);

      const { error } = await supabase.from("students").insert([
        {
          student_id: form.universityId,
          first_name: form.firstName,
          middle_name: form.middleName,
          last_name: form.lastName,
          department: form.department,
          year: form.batch ? new Date(`${form.batch}-01-01`) : null,
          email: form.email || null,
          Gender: form.gender || null,
          "phone-number": form.phoneNumber || null,
          qr_code: qrCodeUrl,
          status: "active",
          registered_at: new Date().toISOString(),
          password: password // Add password field
        }
      ]);

      if (error) throw error;

      setSuccessMessage(`🎉 Student registered successfully! Password: ${password}`);
      
      // Reset form
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
      setGeneratedPassword("");

    } catch (err) {
      setSuccessMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------- CSV HANDLING --------------------------
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      parseCsv(file);
    }
  };

  const parseCsv = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
      error: (error) => {
        setSuccessMessage("❌ Error parsing CSV file");
        console.error("CSV Parse Error:", error);
      }
    });
  };

  const handleCsvRegister = async () => {
    if (csvData.length === 0) {
      setSuccessMessage("❌ CSV is empty or invalid!");
      return;
    }

    setCsvUploading(true);
    setAnimationKey(prev => prev + 1);

    try {
      const formatted = csvData.map((row) => {
        // Generate password for each student
        const password = generatePassword(row.last_name);
        
        return {
          student_id: row.student_id,
          first_name: row.first_name,
          middle_name: row.middle_name,
          last_name: row.last_name,
          department: row.department,
          year: row.registered_year ? new Date(`${row.registered_year}-01-01`) : null,
          qr_code: generateQRCode(row.student_id, row.first_name, row.last_name),
          status: "active",
          registered_at: new Date().toISOString(),
          password: password, // Add password field
          email: row.email || null,
          Gender: row.Gender || null,
          "phone-number": row["phone-number"] || null
        };
      });

      const { error } = await supabase.from("students").insert(formatted);

      if (error) throw error;

      setSuccessMessage(`🎉 ${csvData.length} students registered successfully! Default password: 123+last_name`);
      setCsvData([]);
      setFileName("");
      // Clear file input
      document.getElementById('csv-file').value = '';
    } catch (err) {
      setSuccessMessage(`❌ Error: ${err.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  // -------------------------- ANIMATED BACKGROUND ELEMENTS --------------------------
  const FloatingShape = ({ delay, style }) => (
    <div 
      className={`absolute rounded-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 animate-float ${style}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );

  // -------------------------- UI --------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-4 md:p-6 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <FloatingShape delay="0" style="w-32 h-32 -top-8 -left-8" />
      <FloatingShape delay="2" style="w-24 h-24 top-1/4 -right-6" />
      <FloatingShape delay="4" style="w-40 h-40 bottom-20 left-1/4" />
      <FloatingShape delay="1" style="w-28 h-28 bottom-10 right-20" />
      
      {/* Success Popup */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-sm max-w-md ${
            successMessage.includes("❌") 
              ? "bg-red-100 border-red-300 text-red-800" 
              : "bg-green-100 border-green-300 text-green-800"
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`text-2xl flex-shrink-0 ${successMessage.includes("❌") ? 'animate-shake' : 'animate-bounce'}`}>
                {successMessage.includes("❌") ? "❌" : "🎉"}
              </div>
              <span className="font-semibold break-words">{successMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse">
                <FaUserGraduate className="text-3xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
                <FaCheck />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Student Registration
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Register students individually or upload CSV files for bulk registration. 
            Each student gets a unique QR code and secure password for meal access.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === "manual"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <FaUserGraduate className="text-lg" />
              <span>Manual Registration</span>
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                activeTab === "csv"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <FaUpload className="text-lg" />
              <span>CSV Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Manual Registration Card */}
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transition-all duration-500 ${
            activeTab === "manual" ? "opacity-100 scale-100" : "opacity-70 scale-95"
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <FaUserGraduate className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manual Registration</h2>
                <p className="text-gray-600">Register students one by one</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                  <FaIdCard className="text-blue-500" />
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input 
                      name="firstName" 
                      required 
                      placeholder="First Name" 
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaUserGraduate className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <input 
                    name="middleName" 
                    placeholder="Middle Name" 
                    value={form.middleName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                  
                  <div className="relative">
                    <input 
                      name="lastName" 
                      required 
                      placeholder="Last Name" 
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaUserGraduate className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                  <FaEnvelope className="text-green-500" />
                  <span>Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <select 
                      name="gender" 
                      value={form.gender} 
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <FaVenusMars className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Email Address" 
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input 
                      name="phoneNumber" 
                      placeholder="Phone Number" 
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                  <FaUniversity className="text-purple-500" />
                  <span>Academic Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input 
                      name="department" 
                      required 
                      placeholder="Department" 
                      value={form.department}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaUniversity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input 
                      name="batch" 
                      placeholder="Batch Year" 
                      value={form.batch}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input 
                      name="universityId" 
                      required 
                      placeholder="University ID" 
                      value={form.universityId}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                    <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Password Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center space-x-2">
                  <FaKey className="text-amber-500" />
                  <span>Security Information</span>
                </h3>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaKey className="text-amber-600 text-xl" />
                      <div>
                        <p className="font-semibold text-amber-800">Generated Password</p>
                        <p className="text-amber-700 text-sm">
                          Default password: 123 + Last Name
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={generatedPassword}
                        readOnly
                        className="bg-white border border-amber-300 rounded-lg px-4 py-2 pr-10 text-amber-800 font-mono font-bold text-center min-w-32"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <p className="text-amber-600 text-xs mt-2 text-center">
                    This password will be saved with the student record
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Registering Student...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt />
                    <span>Register Student</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CSV Upload Card */}
          <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transition-all duration-500 ${
            activeTab === "csv" ? "opacity-100 scale-100" : "opacity-70 scale-95"
          }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                <FaFileCsv className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bulk CSV Upload</h2>
                <p className="text-gray-600">Register multiple students at once</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-500 transition-all duration-300 hover:bg-green-50">
                <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="csv-file"
                  className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block hover:scale-105"
                >
                  Choose CSV File
                </label>
                <p className="text-gray-600 mt-4">
                  {fileName || "No file chosen"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supported format: CSV with student data
                </p>
              </div>

              {/* File Info */}
              {csvData.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaCheck className="text-green-600 text-xl" />
                      <div>
                        <p className="font-semibold text-green-800">
                          {csvData.length} students loaded
                        </p>
                        <p className="text-green-600 text-sm">
                          Ready for registration
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {csvData.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Info for CSV */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <FaKey className="text-amber-600 text-xl" />
                  <div>
                    <p className="font-semibold text-amber-800">Auto-Generated Passwords</p>
                    <p className="text-amber-700 text-sm">
                      Each student will get password: 123 + last_name
                    </p>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleCsvRegister}
                disabled={csvUploading || csvData.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {csvUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Registering {csvData.length} Students...</span>
                  </>
                ) : (
                  <>
                    <FaUserGraduate />
                    <span>Register {csvData.length > 0 ? `${csvData.length} Students` : 'From CSV'}</span>
                  </>
                )}
              </button>

              {/* CSV Template Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                  <FaQrcode className="text-blue-600" />
                  <span>CSV Template Format</span>
                </h4>
                <p className="text-blue-700 text-sm">
                  Required columns: student_id, first_name, last_name, department
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Optional: middle_name, registered_year, email, Gender, phone-number
                </p>
                <div className="mt-2 p-2 bg-white rounded-lg border border-blue-300">
                  <code className="text-xs text-blue-800">
                    student_id,first_name,last_name,department,registered_year,email,Gender,phone-number
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <FaQrcode className="text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Instant QR Code</h3>
            <p className="text-gray-600 text-sm">Automatically generate QR codes for meal access</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4">
              <FaShieldAlt className="text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Secure Registration</h3>
            <p className="text-gray-600 text-sm">Encrypted data storage and secure processing</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-4">
              <FaGraduationCap className="text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Bulk Management</h3>
            <p className="text-gray-600 text-sm">Register hundreds of students with CSV upload</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
              <FaKey className="text-2xl" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Auto Password</h3>
            <p className="text-gray-600 text-sm">Automatic password generation (123+last_name)</p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}