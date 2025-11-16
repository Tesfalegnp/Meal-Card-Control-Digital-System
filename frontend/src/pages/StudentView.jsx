// src/pages/StudentView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase_connect";
import { format, parseISO } from "date-fns";
import { FaArrowLeft, FaPrint, FaSync, FaLock, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function StudentView() {
  const { campusId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch student from Supabase
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', campusId)
          .single();

        if (studentError) {
          throw new Error("Student not found");
        }

        if (studentData) {
          // Format student data for display
          const formattedStudent = {
            ...studentData,
            campusId: studentData.student_id,
            universityId: studentData.student_id,
            fullName: `${studentData.first_name || ''} ${studentData.middle_name || ''} ${studentData.last_name || ''}`.trim(),
            firstName: studentData.first_name,
            lastName: studentData.last_name,
            email: studentData.email,
            phoneNumber: studentData["phone-number"],
            department: studentData.department,
            batch: studentData.year ? new Date(studentData.year).getFullYear().toString() : null,
            status: studentData.status || 'Active',
            enrollmentDate: studentData.registered_at,
            gender: studentData.Gender,
            isActive: studentData.status === 'active',
            program: studentData.program,
            address: studentData.address || "Not provided",
            emergency_contact: studentData.emergency_contact || "Not provided",
            meal_plan: studentData.meal_plan || "Standard"
          };
          
          setStudent(formattedStudent);
          
          // Fetch verification history for this student
          await fetchVerificationHistory(studentData.student_id);
        } else {
          setError(`Student with ID "${campusId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        handleFetchError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchVerificationHistory = async (studentId) => {
      try {
        const { data: mealRecords, error: mealError } = await supabase
          .from('meal_records')
          .select('*')
          .eq('student_id', studentId)
          .order('consumed_at', { ascending: false })
          .limit(50);

        if (mealError) throw mealError;

        // Format meal records as verification history
        const history = mealRecords.map(record => ({
          id: record.id,
          studentId: record.student_id,
          mealType: record.meal_type,
          timestamp: record.consumed_at,
          status: 'verified',
          verifiedBy: 'System'
        }));

        setVerificationHistory(history);
      } catch (historyErr) {
        console.warn("Could not fetch verification history:", historyErr);
      }
    };

    const handleFetchError = (err) => {
      if (err.message?.includes("Student not found")) {
        setError(`Student with ID "${campusId}" not found. Please check the student ID and try again.`);
      } else if (err.message?.includes("Network Error")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Failed to load student data: ${err.message}`);
      }
    };

    if (campusId) {
      fetchStudentData();
    } else {
      setError("No student ID provided in the URL.");
      setLoading(false);
    }
  }, [campusId]);

  // Password Reset Function - Updated with your logic
  const handlePasswordReset = async () => {
    if (!student || !window.confirm("Are you sure you want to reset this student's password to default?\n\nDefault password will be: 123" + (student.lastName?.toLowerCase() || ''))) {
      return;
    }

    try {
      setResettingPassword(true);
      
      // Generate default password: "123+last_name" (your logic)
      const defaultPassword = `123${student.lastName || ''}`.toLowerCase();
      
      // Update student password in database - without updated_at field
      const { error } = await supabase
        .from('students')
        .update({ 
          password: defaultPassword
          // Removed updated_at since it doesn't exist in students table
        })
        .eq('student_id', campusId);

      if (error) throw error;

      setPasswordResetSuccess(true);
      setTimeout(() => setPasswordResetSuccess(false), 5000);

    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password: " + err.message);
    } finally {
      setResettingPassword(false);
    }
  };

  // Export Student Data
  const handleExportData = async () => {
    try {
      setExportingData(true);
      
      const studentData = {
        ...student,
        verificationHistory,
        exportedAt: new Date().toISOString(),
        totalMeals: verificationHistory.filter(v => v.status === 'verified').length
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(studentData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_${student.campusId}_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Failed to export student data");
    } finally {
      setExportingData(false);
    }
  };

  // Send Email to Student
  const handleSendEmail = () => {
    const subject = encodeURIComponent("Regarding Your Student Account");
    const body = encodeURIComponent(`Dear ${student.fullName},\n\n`);
    window.open(`mailto:${student.email}?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-semibold">Loading student profile...</p>
          <p className="text-blue-600 text-sm mt-2">ID: {campusId}</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/students")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <button
              onClick={() => navigate("/students")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Students
            </button>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {student.fullName?.split(' ').map(n => n[0]).join('') || "SS"}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{student.fullName}</h1>
                  <p className="text-gray-600 mt-1">{student.department || "Department not specified"}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {student.email && (
                      <button
                        onClick={handleSendEmail}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm transition-colors"
                      >
                        <FaEnvelope className="text-xs" />
                        {student.email}
                      </button>
                    )}
                    {student.phoneNumber && (
                      <span className="flex items-center gap-1 text-gray-600 text-sm">
                        <FaPhone className="text-xs" />
                        {student.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg px-6 py-3 border border-blue-100">
                <p className="text-sm text-gray-600 font-medium">Campus ID</p>
                <p className="font-mono font-bold text-blue-600 text-xl">{student.campusId}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              disabled={exportingData}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2 font-semibold transition-colors shadow-sm"
            >
              {exportingData ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <FaDownload />
              )}
              {exportingData ? "Exporting..." : "Export"}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2 font-semibold transition-colors shadow-sm"
            >
              <FaPrint />
              Print
            </button>
            <button
              onClick={() => navigate(`/qr-print?studentId=${student.campusId}`)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FaPrint />
              Print QR
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{verificationHistory.filter(v => v.status === 'verified').length}</div>
            <div className="text-gray-600 text-sm">Total Meals</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">{student.batch || "N/A"}</div>
            <div className="text-gray-600 text-sm">Batch Year</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {student.status === 'active' ? '✅' : '❌'}
            </div>
            <div className="text-gray-600 text-sm">Status</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">
              {student.batch ? new Date().getFullYear() - parseInt(student.batch) : "N/A"}
            </div>
            <div className="text-gray-600 text-sm">Year of Study</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "overview", label: "Overview", icon: "👤" },
                { id: "academic", label: "Academic", icon: "🎓" },
                { id: "contact", label: "Contact Info", icon: "📞" },
                { id: "security", label: "Security", icon: "🔒" },
                { id: "verification-history", label: "Meal History", icon: "📊" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 flex-1 py-4 px-6 text-center font-semibold transition-all ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && <OverviewTab student={student} verificationHistory={verificationHistory} />}
            {activeTab === "academic" && <AcademicTab student={student} />}
            {activeTab === "contact" && <ContactTab student={student} onSendEmail={handleSendEmail} />}
            {activeTab === "security" && (
              <SecurityTab 
                student={student} 
                onPasswordReset={handlePasswordReset}
                resettingPassword={resettingPassword}
                passwordResetSuccess={passwordResetSuccess}
              />
            )}
            {activeTab === "verification-history" && <VerificationHistoryTab verificationHistory={verificationHistory} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Tab Components
const OverviewTab = ({ student, verificationHistory }) => {
  const recentVerifications = verificationHistory
    .filter(v => v.status === 'verified')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Photo & Basic Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg">
              {student.fullName?.split(' ').map(n => n[0]).join('') || "SS"}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{student.fullName}</h2>
            <p className="text-gray-600 mb-4">{student.department || "Department not specified"}</p>
            
            <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.status || 'Active'}
                </span>
              </div>
            </div>

            <label className="cursor-pointer block">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    console.log("Photo selected for upload:", e.target.files[0]);
                    alert("Photo upload functionality would be implemented here. Selected file: " + e.target.files[0].name);
                  }
                }} 
              />
              <div className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors inline-flex items-center gap-2 w-full justify-center shadow-lg hover:shadow-xl">
                <span>📷</span>
                Upload Student Photo
              </div>
            </label>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-600">📈</span>
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Meals</span>
                <span className="font-bold text-gray-800">{verificationHistory.filter(v => v.status === 'verified').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold text-gray-800">
                  {verificationHistory.filter(v => {
                    const logDate = new Date(v.timestamp);
                    const now = new Date();
                    return v.status === 'verified' && 
                           logDate.getMonth() === now.getMonth() && 
                           logDate.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Verified</span>
                <span className="font-bold text-gray-800 text-sm">
                  {recentVerifications[0] ? 
                    format(new Date(recentVerifications[0].timestamp), "MMM dd") : 
                    "Never"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Full Name" value={student.fullName} />
              <InfoRow label="Campus ID" value={student.campusId} />
              <InfoRow label="Email" value={student.email || "Not provided"} />
              <InfoRow label="Phone" value={student.phoneNumber || "Not provided"} />
              <InfoRow label="Gender" value={student.gender || "Not specified"} />
              <InfoRow label="Enrollment Date" value={student.enrollmentDate ? format(parseISO(student.enrollmentDate), "MMM dd, yyyy") : "Not specified"} />
              <InfoRow label="Meal Plan" value={student.meal_plan || "Standard"} />
              <InfoRow label="Address" value={student.address || "Not provided"} />
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-green-500">🏫</span>
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Department" value={student.department || "Not specified"} />
              <InfoRow label="Batch/Year" value={student.batch || "Not specified"} />
              <InfoRow label="Program" value={student.program || "Not specified"} />
              <InfoRow label="Status" value={student.status || "Active"} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-500">🕒</span>
              Recent Meal Activity
            </h3>
            {recentVerifications.length > 0 ? (
              <div className="space-y-3">
                {recentVerifications.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        log.mealType === "breakfast" ? "bg-orange-100 text-orange-600" :
                        log.mealType === "lunch" ? "bg-green-100 text-green-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {log.mealType === "breakfast" ? "🍳" : log.mealType === "lunch" ? "🍛" : "🌙"}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800 capitalize">{log.mealType}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(log.timestamp), "MMM dd, yyyy 'at' HH:mm")}
                        </div>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🍽️</div>
                <p>No recent meal verifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AcademicTab = ({ student }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Academic Details */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🎓</span>
          Academic Profile
        </h3>
        <div className="space-y-4">
          <InfoRow label="Department" value={student.department || "Not specified"} />
          <InfoRow label="Program" value={student.program || "Not specified"} />
          <InfoRow label="Batch/Year" value={student.batch || "Not specified"} />
          <InfoRow label="Student Type" value={student.studentType || "Regular"} />
          <InfoRow label="Academic Status" value={student.status || "Active"} />
        </div>
      </div>

      {/* Enrollment Information */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-green-600">📅</span>
          Enrollment Details
        </h3>
        <div className="space-y-4">
          <InfoRow label="Enrollment Date" value={student.enrollmentDate ? format(parseISO(student.enrollmentDate), "MMM dd, yyyy") : "Not specified"} />
          <InfoRow label="Meal Plan" value={student.meal_plan || "Standard"} />
          <InfoRow label="Scholarship" value={student.scholarship || "None"} />
          <InfoRow label="Years Completed" value={student.batch ? new Date().getFullYear() - parseInt(student.batch) : "N/A"} />
        </div>
      </div>
    </div>

    {/* Additional Information */}
    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-purple-600">📋</span>
        Additional Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Registration Date" value={student.registrationDate ? format(new Date(student.registrationDate), "MMM dd, yyyy") : "Not specified"} />
        <InfoRow label="Last Updated" value={student.updated_at ? format(new Date(student.updated_at), "MMM dd, yyyy") : "Not available"} />
        <InfoRow label="Account Created" value={student.created_at ? format(new Date(student.created_at), "MMM dd, yyyy") : "Not available"} />
        <InfoRow label="Student Category" value={student.category || "Undergraduate"} />
      </div>
    </div>
  </div>
);

const ContactTab = ({ student, onSendEmail }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contact Information */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaEnvelope className="text-blue-600" />
          Contact Information
        </h3>
        <div className="space-y-4">
          <InfoRow label="Email Address" value={student.email || "Not provided"} />
          <InfoRow label="Phone Number" value={student.phoneNumber || "Not provided"} />
          <InfoRow label="Address" value={student.address || "Not provided"} />
        </div>
        {student.email && (
          <button
            onClick={onSendEmail}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 py-3 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FaEnvelope />
            Send Email to Student
          </button>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-red-500">🆘</span>
          Emergency Contact
        </h3>
        <div className="space-y-4">
          <InfoRow label="Contact Person" value={student.emergency_contact || "Not provided"} />
          <InfoRow label="Relationship" value={student.emergency_relation || "Not specified"} />
          <InfoRow label="Contact Phone" value={student.emergency_phone || "Not provided"} />
          <InfoRow label="Address" value={student.emergency_address || "Not provided"} />
        </div>
      </div>
    </div>

    {/* Communication History */}
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-green-600">💬</span>
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg text-center group">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <FaPhone className="text-blue-600" />
          </div>
          <span className="font-semibold text-gray-800">Call Student</span>
          <p className="text-sm text-gray-600 mt-1">{student.phoneNumber || "Not available"}</p>
        </button>
        
        <button 
          onClick={onSendEmail}
          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-400 transition-all hover:shadow-lg text-center group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <FaEnvelope className="text-green-600" />
          </div>
          <span className="font-semibold text-gray-800">Send Email</span>
          <p className="text-sm text-gray-600 mt-1">{student.email || "Not available"}</p>
        </button>
        
        <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-400 transition-all hover:shadow-lg text-center group">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <FaMapMarkerAlt className="text-purple-600" />
          </div>
          <span className="font-semibold text-gray-800">View Location</span>
          <p className="text-sm text-gray-600 mt-1">{student.address || "Not available"}</p>
        </button>
      </div>
    </div>
  </div>
);

const SecurityTab = ({ student, onPasswordReset, resettingPassword, passwordResetSuccess }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaLock className="text-red-600" />
          Account Security
        </h3>
        <p className="text-gray-600 mb-6">
          Manage student account security settings and password reset options.
        </p>

        {/* Password Reset Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2 text-lg">
            <FaSync />
            Password Reset
          </h4>
          <p className="text-yellow-700 text-sm mb-4">
            Reset the student's password to the default format. This is useful if the student has forgotten their password.
          </p>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <p className="text-sm font-medium text-gray-700 mb-2">Default Password Format:</p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono block text-center">
                123 + last_name (lowercase)
              </code>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Example for {student.lastName || 'student'}: <code className="bg-gray-100 px-2 py-1 rounded font-mono">123{(student.lastName || 'student').toLowerCase()}</code>
              </p>
            </div>

            {passwordResetSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✅</span>
                  <span className="font-medium">Password reset successfully!</span>
                </div>
                <p className="text-sm">
                  New password has been set to: <code className="bg-green-200 px-2 py-1 rounded font-mono">123{(student.lastName || '').toLowerCase()}</code>
                </p>
                <p className="text-xs mt-2 text-green-700">
                  The student should change their password after next login for security.
                </p>
              </div>
            )}

            <button
              onClick={onPasswordReset}
              disabled={resettingPassword}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                       disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl 
                       transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3 text-lg"
            >
              {resettingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <FaLock />
                  Reset to Default Password
                </>
              )}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-semibold text-blue-800 mb-1 text-sm">Security Notes:</h5>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• Passwords are encrypted and stored securely</li>
                <li>• Default password format: 123 + student's last name in lowercase</li>
                <li>• Student will be prompted to change password on next login</li>
                <li>• Contact IT support for any account security issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-green-600">🛡️</span>
          Account Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Account Status" value={student.status || "Active"} />
          <InfoRow label="Last Password Change" value={student.last_password_change ? format(new Date(student.last_password_change), "MMM dd, yyyy") : "Not recorded"} />
          <InfoRow label="Account Created" value={student.created_at ? format(new Date(student.created_at), "MMM dd, yyyy") : "Not available"} />
          <InfoRow label="Last Login" value={student.last_login ? format(new Date(student.last_login), "MMM dd, yyyy") : "Never"} />
        </div>
      </div>
    </div>
  );
};

const VerificationHistoryTab = ({ verificationHistory }) => {
  const verifiedMeals = verificationHistory.filter(v => v.status === 'verified');
  const failedMeals = verificationHistory.filter(v => v.status === 'failed');

  // Group by date for better organization
  const groupedByDate = verificationHistory.reduce((acc, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span>📊</span>
            Meal Verification History
          </h3>
          <p className="text-gray-600 text-sm mt-1">Complete record of all meal verifications</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-medium border border-green-200">
            ✅ Verified: {verifiedMeals.length}
          </div>
          <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm font-medium border border-red-200">
            ❌ Failed: {failedMeals.length}
          </div>
        </div>
      </div>

      {verificationHistory.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, logs]) => (
              <div key={date} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800">
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {logs
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((log, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                            log.mealType === "breakfast" ? "bg-orange-100 text-orange-600" :
                            log.mealType === "lunch" ? "bg-green-100 text-green-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            {log.mealType === "breakfast" ? "🍳" : log.mealType === "lunch" ? "🍛" : "🌙"}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800 capitalize">{log.mealType}</div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(log.timestamp), "HH:mm:ss")}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          log.status === "verified" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}>
                          {log.status === "verified" ? "✅ Verified" : "❌ Failed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">📊</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No Verification History</h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This student hasn't verified any meals yet. Meal verification records will appear here once the student starts using the meal card system.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-800 text-right font-semibold max-w-[60%] text-sm bg-white px-3 py-1 rounded border">
      {value}
    </span>
  </div>
);