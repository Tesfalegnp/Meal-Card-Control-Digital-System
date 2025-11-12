// src/pages/StudentView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase_connect";
import { format, parseISO } from "date-fns";

export default function StudentView() {
  const { campusId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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
            isActive: studentData.status === 'active'
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
          .order('consumed_at', { ascending: false });

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
        // Continue without history - it's optional
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

  // Enhanced mock data that matches your database structure
  const mockStudent = {
    id: campusId,
    fullName: "Sample Student",
    campusId: campusId,
    universityId: campusId,
    email: "student@mtu.edu.et",
    phoneNumber: "+251-XXX-XXXX",
    address: "Mekelle University Campus",
    department: "Computer Science",
    batch: "2023",
    program: "Undergraduate",
    status: "Active",
    enrollmentDate: "2023-09-01",
    registrationDate: new Date().toISOString(),
    emergencyContact: {
      name: "Parent Name",
      phone: "+251-XXX-XXXX",
      relationship: "Parent"
    },
    firstName: "Sample",
    lastName: "Student",
    gender: "Male",
    isActive: true
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-semibold">Loading student profile...</p>
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
              onClick={() => navigate("/daily-status")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/students")}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              View All Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use real data if available, otherwise use enhanced mock data
  const displayStudent = student || mockStudent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <button
              onClick={() => navigate("/daily-status")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {displayStudent.fullName?.split(' ').map(n => n[0]).join('') || "SS"}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{displayStudent.fullName}</h1>
                  <p className="text-gray-600 mt-1">{displayStudent.department || "Department not specified"}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg px-6 py-3 border border-blue-100">
                <p className="text-sm text-gray-600 font-medium">Campus ID</p>
                <p className="font-mono font-bold text-blue-600 text-xl">{displayStudent.campusId}</p>
              </div>
            </div>
            {!student && (
              <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-sm inline-flex items-center gap-2">
                ⚠️ Showing demo data. Student data not loaded from server.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2 font-semibold transition-colors shadow-sm"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => navigate(`/verify?student=${displayStudent.campusId}`)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              ✅ Verify Meal
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{verificationHistory.filter(v => v.status === 'verified').length}</div>
            <div className="text-gray-600 text-sm">Verified Meals</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">{displayStudent.batch || "N/A"}</div>
            <div className="text-gray-600 text-sm">Batch Year</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">
              {displayStudent.status === 'Active' ? '✅' : '❌'} {displayStudent.status || 'Active'}
            </div>
            <div className="text-gray-600 text-sm">Status</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">
              {new Date().getFullYear() - parseInt(displayStudent.batch) || 1}
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
                { id: "overview", label: "Student Overview", icon: "👤" },
                { id: "academic", label: "Academic Details", icon: "🎓" },
                { id: "verification-history", label: "Meal History", icon: "📊" },
                { id: "documents", label: "Documents", icon: "📁" }
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
            {activeTab === "overview" && <OverviewTab student={displayStudent} verificationHistory={verificationHistory} />}
            {activeTab === "academic" && <AcademicTab student={displayStudent} />}
            {activeTab === "verification-history" && <VerificationHistoryTab verificationHistory={verificationHistory} />}
            {activeTab === "documents" && <DocumentsTab student={displayStudent} />}
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
                  student.status === 'Active' 
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

          {/* Emergency Contact */}
          <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-red-500">🆘</span>
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <InfoRow label="Contact Person" value={student.emergencyContact?.name || "Not provided"} />
              <InfoRow label="Contact Phone" value={student.emergencyContact?.phone || "Not provided"} />
              <InfoRow label="Relationship" value={student.emergencyContact?.relationship || "Not provided"} />
            </div>
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
              <InfoRow label="Email" value={student.email || student.emailAddress || "Not provided"} />
              <InfoRow label="Phone" value={student.phone || student.phoneNumber || "Not provided"} />
              <InfoRow label="Gender" value={student.gender || "Not specified"} />
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
              <InfoRow label="Enrollment Date" value={student.enrollmentDate ? format(parseISO(student.enrollmentDate), "MMM dd, yyyy") : "Not specified"} />
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
                        <div className="text-sm text-gray-600">{format(new Date(log.timestamp), "MMM dd, yyyy")}</div>
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
          <InfoRow label="CGPA" value={student.cgpa || "Not available"} />
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
          <InfoRow label="Academic Status" value={student.status || "Active"} />
          <InfoRow label="Student Type" value={student.studentType || "Regular"} />
          <InfoRow label="Scholarship" value={student.scholarship || "None"} />
        </div>
      </div>
    </div>

    {/* Additional Information */}
    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 border border-purple-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-purple-600">📚</span>
        Additional Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Registration Date" value={student.registrationDate ? format(new Date(student.registrationDate), "MMM dd, yyyy") : "Not specified"} />
        <InfoRow label="Meal Plan Type" value={student.mealPlan || "Standard"} />
        <InfoRow label="Last Updated" value={student.updatedAt ? format(new Date(student.updatedAt), "MMM dd, yyyy") : "Not available"} />
        <InfoRow label="Created Date" value={student.createdAt ? format(new Date(student.createdAt), "MMM dd, yyyy") : "Not available"} />
      </div>
    </div>
  </div>
);

const VerificationHistoryTab = ({ verificationHistory }) => {
  const verifiedMeals = verificationHistory.filter(v => v.status === 'verified');
  const failedMeals = verificationHistory.filter(v => v.status === 'failed');

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
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Date</th>
                <th className="px-4 py-4 text-left font-semibold">Meal Type</th>
                <th className="px-4 py-4 text-left font-semibold">Time</th>
                <th className="px-4 py-4 text-left font-semibold">Status</th>
                <th className="px-4 py-4 text-left font-semibold">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verificationHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((log, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {format(new Date(log.timestamp), "MMM dd, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      log.mealType === "breakfast" ? "bg-orange-100 text-orange-800 border-orange-200" :
                      log.mealType === "lunch" ? "bg-green-100 text-green-800 border-green-200" :
                      "bg-blue-100 text-blue-800 border-blue-200"
                    }`}>
                      {log.mealType === "breakfast" && "🍳"}
                      {log.mealType === "lunch" && "🍛"}
                      {log.mealType === "dinner" && "🌙"}
                      {log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {format(new Date(log.timestamp), "HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      log.status === "verified" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      {log.status === "verified" ? "✅ Verified" : "❌ Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">
                    {log.verifiedBy || "System"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <button 
            onClick={() => window.location.href = '/verify'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Verify First Meal
          </button>
        </div>
      )}
    </div>
  );
};

const DocumentsTab = ({ student }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <span>📁</span>
        Student Documents
      </h3>
      <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-lg hover:shadow-xl">
        📤 Upload Document
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DocumentCard 
        title="Student ID Card"
        description="Official university identification card"
        icon="🆔"
        status="Verified"
        statusColor="green"
        studentId={student.campusId}
      />
      
      <DocumentCard 
        title="Student Photo"
        description="Recent passport-sized photograph"
        icon="📷"
        status="Pending"
        statusColor="yellow"
      />
      
      <DocumentCard 
        title="Admission Letter"
        description="University admission documentation"
        icon="📄"
        status="Verified"
        statusColor="green"
      />
      
      <DocumentCard 
        title="Academic Transcript"
        description="Current academic performance record"
        icon="📊"
        status="Not Uploaded"
        statusColor="red"
      />
      
      <DocumentCard 
        title="Medical Records"
        description="Health and medical information"
        icon="🏥"
        status="Not Uploaded"
        statusColor="red"
      />
      
      <DocumentCard 
        title="Other Documents"
        description="Additional supporting documents"
        icon="📂"
        status="Not Uploaded"
        statusColor="red"
      />
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <span className="text-xl text-blue-600">💡</span>
        <div>
          <h4 className="font-semibold text-blue-800 mb-2">Document Management</h4>
          <p className="text-blue-700 text-sm">
            Student documents can be uploaded through the administrative portal or mobile application. 
            Once uploaded, documents will be available for viewing in this section. Verified documents are marked with a green status.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DocumentCard = ({ title, description, icon, status, statusColor, studentId }) => {
  const statusColors = { 
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-lg group">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <span className="text-2xl">{icon}</span>
      </div>
      <h4 className="font-semibold text-gray-800 mb-2 text-center">{title}</h4>
      <p className="text-gray-600 text-sm mb-4 text-center">{description}</p>
      
      {studentId && title === "Student ID Card" && (
        <div className="text-center mb-3">
          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
            {studentId}
          </div>
        </div>
      )}
      
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border mx-auto block w-fit ${statusColors[statusColor]}`}>
        {status}
      </div>
    </div>
  );
};

// Enhanced Helper component for info rows
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors">
    <span className="text-gray-600 font-medium flex items-center gap-2">
      {label}
    </span>
    <span className="text-gray-800 text-right font-semibold max-w-[60%] text-sm bg-white px-3 py-1 rounded border">
      {value}
    </span>
  </div>
);