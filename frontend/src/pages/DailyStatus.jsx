// src/pages/DailyStatus.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';

const DailyStatus = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealStats, setMealStats] = useState({
    breakfast: { total: 0, ate: 0 },
    lunch: { total: 0, ate: 0 },
    dinner: { total: 0, ate: 0 }
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyStatus();
  }, [selectedDate]);

  const fetchDailyStatus = async () => {
    try {
      setLoading(true);
      
      // Get total students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id, first_name, last_name, department');
      
      if (studentsError) throw studentsError;

      // Get meal records for selected date
      const { data: mealData, error: mealError } = await supabase
        .from('meal_records')
        .select('student_id, meal_type')
        .eq('meal_date', selectedDate);

      if (mealError) throw mealError;

      // Calculate statistics
      const totalStudents = studentsData.length;
      const breakfastAte = mealData.filter(record => record.meal_type === 'breakfast').length;
      const lunchAte = mealData.filter(record => record.meal_type === 'lunch').length;
      const dinnerAte = mealData.filter(record => record.meal_type === 'dinner').length;

      setMealStats({
        breakfast: { total: totalStudents, ate: breakfastAte },
        lunch: { total: totalStudents, ate: lunchAte },
        dinner: { total: totalStudents, ate: dinnerAte }
      });

      // Prepare student list with meal status
      const studentsWithStatus = studentsData.map(student => {
        const studentMeals = mealData.filter(record => record.student_id === student.student_id);
        return {
          ...student,
          breakfast: studentMeals.some(meal => meal.meal_type === 'breakfast'),
          lunch: studentMeals.some(meal => meal.meal_type === 'lunch'),
          dinner: studentMeals.some(meal => meal.meal_type === 'dinner')
        };
      });

      setStudents(studentsWithStatus);

    } catch (error) {
      console.error('Error fetching daily status:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, ate, total, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{ate}</p>
          <p className="text-sm text-gray-500">out of {total} students</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{((ate / total) * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">participation</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Meal Status</h1>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={fetchDailyStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Breakfast"
            ate={mealStats.breakfast.ate}
            total={mealStats.breakfast.total}
            color="border-orange-500"
          />
          <StatCard
            title="Lunch"
            ate={mealStats.lunch.ate}
            total={mealStats.lunch.total}
            color="border-blue-500"
          />
          <StatCard
            title="Dinner"
            ate={mealStats.dinner.ate}
            total={mealStats.dinner.total}
            color="border-purple-500"
          />
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Student Meal Attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakfast
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lunch
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dinner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.breakfast 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.breakfast ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.lunch 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.lunch ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.dinner 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.dinner ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyStatus;
// import React, { useEffect, useState } from "react";
// import { api } from "../services/api";
// import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import { FaSearch } from "react-icons/fa"; 

// export default function DailyStatus() {
//   const [students, setStudents] = useState([]);
//   const [verifications, setVerifications] = useState({});
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
//   const [selectedMeal, setSelectedMeal] = useState("all"); // "all", "breakfast", "lunch", "dinner"
//   const [expandedStudent, setExpandedStudent] = useState(null);
//   const navigate = useNavigate();

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
//   const monthDays = eachDayOfInterval({
//     start: startOfMonth(new Date(selectedYear, selectedMonth)),
//     end: endOfMonth(new Date(selectedYear, selectedMonth))
//   });

//   const fetchStudents = async () => {
//     try {
//       const res = await api.get("/students");
//       if (res.data.success) {
//         // Map universityId to campusId for frontend compatibility
//         const sortedStudents = res.data.students.map(student => ({
//           ...student,
//           campusId: student.universityId // Fix: Map universityId to campusId
//         })).sort((a, b) => a.fullName.localeCompare(b.fullName));
        
//         setStudents(sortedStudents);
//         setFilteredStudents(sortedStudents);
//       }
//     } catch (err) {
//       console.error("Error fetching students:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchVerifications = async () => {
//     try {
//       const res = await api.get(`/verification-logs?month=${selectedMonth + 1}&year=${selectedYear}`);
//       if (res.data.success) {
//         const map = {};
//         res.data.logs.forEach((log) => {
//           const key = `${log.universityId}-${log.date}`; // Fix: Use universityId instead of campusId
//           if (!map[key]) map[key] = {};
//           map[key][log.mealType] = {
//             status: log.status,
//             timestamp: log.timestamp,
//           };
//         });
//         setVerifications(map);
//       }
//     } catch (err) {
//       console.error("Error fetching verifications:", err);
//     }
//   };

//   // 🔍 Fix search functionality
//   useEffect(() => {
//     if (search.trim() === "") {
//       setFilteredStudents(students);
//     } else {
//       const lowerSearch = search.toLowerCase();
//       const filtered = students.filter(
//         (s) =>
//           s.fullName?.toLowerCase().includes(lowerSearch) ||
//           s.campusId?.toLowerCase().includes(lowerSearch) ||
//           s.department?.toLowerCase().includes(lowerSearch)
//       );
//       setFilteredStudents(filtered);
//     }
//   }, [search, students]);

//   const handleVerify = async (student, mealType, day) => {
//     try {
//       const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//       const key = `${student.campusId}-${date}`;
//       const existingVerification = verifications[key]?.[mealType];

//       if (existingVerification?.status === "verified") {
//         const verificationTime = new Date(existingVerification.timestamp);
//         const currentTime = new Date();
//         const timeDiff = (currentTime - verificationTime) / (1000 * 60);

//         if (timeDiff < 10) {
//           setVerifications((prev) => ({
//             ...prev,
//             [key]: {
//               ...prev[key],
//               [mealType]: { status: "failed", timestamp: currentTime },
//             },
//           }));
//           return { success: false, message: "Warning: Verification attempted too soon!" };
//         }
//       }

//       const qrData = JSON.stringify({ 
//         campusId: student.campusId, 
//         universityId: student.campusId, // Send both for compatibility
//         date 
//       });
//       const res = await api.post("/verify-meal", { qrData, mealType });

//       if (res.data.success) {
//         await fetchVerifications();
//       }
//       return res.data;
//     } catch (err) {
//       console.error("Verification error:", err);
//       return { success: false, message: "Verification failed!" };
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   useEffect(() => {
//     fetchVerifications();
//   }, [selectedMonth, selectedYear]);

//   // Calculate statistics
//   const stats = { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
//   const todayStats = { breakfast: 0, lunch: 0, dinner: 0 };
//   const today = format(new Date(), 'yyyy-MM-dd');

//   Object.entries(verifications).forEach(([key, value]) => {
//     ["breakfast", "lunch", "dinner"].forEach((meal) => {
//       if (value[meal]?.status === "verified") {
//         stats[meal]++;
//         stats.total++;
//         if (key.includes(today)) {
//           todayStats[meal]++;
//         }
//       }
//     });
//   });

//   const getVerificationStatus = (student, day, mealType) => {
//     const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//     const key = `${student.campusId}-${date}`;
//     return verifications[key]?.[mealType];
//   };

//   const getMealIcon = (mealType) => {
//     switch (mealType) {
//       case "breakfast": return "🍳";
//       case "lunch": return "🍛";
//       case "dinner": return "🌙";
//       default: return "🍽️";
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "verified": return "bg-green-100 border-green-500 text-green-800";
//       case "failed": return "bg-red-100 border-red-500 text-red-800";
//       default: return "bg-gray-100 border-gray-300 text-gray-600";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-blue-800 font-semibold">Loading student data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
//       {/* Header Section */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
//                 📊
//               </div>
//               Daily Meal Verification Dashboard
//             </h1>
//             <p className="text-gray-600 mt-2">Monitor and manage student meal verifications in real-time</p>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             <select
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(Number(e.target.value))}
//               className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-800"
//             >
//               {months.map((m, i) => (
//                 <option key={i} value={i}>
//                   {m}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="number"
//               min="2020"
//               max="2100"
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(Number(e.target.value))}
//               className="border border-gray-300 rounded-xl px-4 py-2 w-24 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-800"
//             />
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
//           <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
//             <div className="text-2xl font-bold">{filteredStudents.length}</div>
//             <div className="text-blue-100 text-sm">Total Students</div>
//           </div>
//           <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
//             <div className="text-2xl font-bold">{stats.breakfast}</div>
//             <div className="text-green-100 text-sm">🍳 Breakfast</div>
//           </div>
//           <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg">
//             <div className="text-2xl font-bold">{stats.lunch}</div>
//             <div className="text-orange-100 text-sm">🍛 Lunch</div>
//           </div>
//           <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
//             <div className="text-2xl font-bold">{stats.dinner}</div>
//             <div className="text-purple-100 text-sm">🌙 Dinner</div>
//           </div>
//           <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
//             <div className="text-2xl font-bold">{stats.total}</div>
//             <div className="text-indigo-100 text-sm">Total Meals</div>
//           </div>
//         </div>
//       </div>

//       {/* Controls Section */}
//       <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-blue-100">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//             {/* 🔍 Fixed Search Bar */}
//             <div className="relative w-full md:w-64">
//               <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name or ID..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-800"
//               />
//             </div>
            
//             <select
//               value={selectedMeal}
//               onChange={(e) => setSelectedMeal(e.target.value)}
//               className="w-full md:w-auto border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white text-gray-800"
//             >
//               <option value="all">All Meals</option>
//               <option value="breakfast">Breakfast</option>
//               <option value="lunch">Lunch</option>
//               <option value="dinner">Dinner</option>
//             </select>
//           </div>

//           <div className="flex gap-2 w-full md:w-auto">
//             <button
//               onClick={() => setViewMode("table")}
//               className={`flex-1 px-4 py-2 rounded-xl transition-all ${
//                 viewMode === "table" 
//                   ? "bg-blue-500 text-white shadow-lg" 
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               📋 Table View
//             </button>
//             <button
//               onClick={() => setViewMode("cards")}
//               className={`flex-1 px-4 py-2 rounded-xl transition-all ${
//                 viewMode === "cards" 
//                   ? "bg-blue-500 text-white shadow-lg" 
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               🃏 Card View
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       {viewMode === "table" ? (
//         /* Table View - Fixed Text Colors */
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
//           <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
//             <table className="min-w-full text-sm border-collapse">
//               <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
//                 <tr>
//                   <th className="px-4 py-4 sticky left-0 bg-blue-500 z-20 border-r border-blue-400 font-semibold text-left min-w-[80px] text-white">
//                     #
//                   </th>
//                   <th className="px-4 py-4 sticky left-16 bg-blue-500 z-20 border-r border-blue-400 font-semibold text-left min-w-[180px] text-white">
//                     Student
//                   </th>
//                   <th className="px-4 py-4 sticky left-64 bg-blue-500 z-20 border-r border-blue-400 font-semibold text-left min-w-[120px] text-white">
//                     Campus ID
//                   </th>
//                   {monthDays.map((day, i) => (
//                     <th key={i} className="px-3 py-4 text-center whitespace-nowrap min-w-[140px] border-r border-blue-400">
//                       <div className="flex flex-col">
//                         <span className="font-semibold text-white">{i + 1}</span>
//                         <span className="text-xs text-blue-100">{format(day, 'EEE')}</span>
//                       </div>
//                     </th>
//                   ))}
//                   <th className="px-4 py-4 sticky right-0 bg-blue-500 z-20 border-l border-blue-400 font-semibold text-center min-w-[100px] text-white">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredStudents.map((student, idx) => (
//                   <tr key={student.campusId} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
//                     {/* Fixed Text Colors for Better Visibility */}
//                     <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r font-medium text-gray-900">{idx + 1}</td>
//                     <td className="px-4 py-3 sticky left-16 bg-white z-10 border-r font-medium min-w-[180px]">
//                       <div className="font-semibold text-gray-900">{student.fullName}</div>
//                       <div className="text-xs text-gray-700">{student.department}</div>
//                     </td>
//                     {/* Fixed Campus ID Visibility */}
//                     <td className="px-4 py-3 sticky left-64 bg-white z-10 border-r font-mono font-bold text-gray-900 min-w-[120px] bg-blue-50">
//                       <div className="bg-blue-100 px-2 py-1 rounded-lg text-center border border-blue-200">
//                         {student.campusId}
//                       </div>
//                     </td>
//                     {monthDays.map((day, dayIdx) => {
//                       const dayNumber = dayIdx + 1;
//                       return (
//                         <td key={dayIdx} className="px-2 py-3 text-center border-r border-gray-200 min-w-[140px]">
//                           <div className="flex flex-col gap-1">
//                             {["breakfast", "lunch", "dinner"].map((meal) => {
//                               if (selectedMeal !== "all" && selectedMeal !== meal) return null;
                              
//                               const info = getVerificationStatus(student, dayNumber, meal);
//                               const isToday = dayIdx + 1 === new Date().getDate() && 
//                                             selectedMonth === new Date().getMonth() && 
//                                             selectedYear === new Date().getFullYear();

//                               return (
//                                 <div
//                                   key={meal}
//                                   className={`flex items-center justify-center p-1 rounded-lg border-2 text-xs font-medium transition-all ${
//                                     info?.status === "verified"
//                                       ? "bg-green-100 border-green-500 text-green-800"
//                                       : info?.status === "failed"
//                                       ? "bg-red-100 border-red-500 text-red-800"
//                                       : isToday
//                                       ? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 cursor-pointer"
//                                       : "bg-gray-100 border-gray-300 text-gray-600"
//                                   }`}
//                                   onClick={async () => {
//                                     if (!info && isToday) {
//                                       const result = await handleVerify(student, meal, dayNumber);
//                                       if (!result.success) {
//                                         alert(result.message);
//                                       }
//                                     }
//                                   }}
//                                   title={
//                                     info?.status === "verified" 
//                                       ? `Verified at ${format(new Date(info.timestamp), "HH:mm:ss")}`
//                                       : info?.status === "failed"
//                                       ? "Verification failed - retry limit"
//                                       : isToday
//                                       ? `Click to verify ${meal}`
//                                       : "Not verified"
//                                   }
//                                 >
//                                   {info?.status === "verified" ? (
//                                     <span className="flex items-center gap-1">
//                                       ✅ <span className="hidden sm:inline">{getMealIcon(meal)}</span>
//                                     </span>
//                                   ) : info?.status === "failed" ? (
//                                     <span className="flex items-center gap-1">
//                                       ⚠️ <span className="hidden sm:inline">{getMealIcon(meal)}</span>
//                                     </span>
//                                   ) : (
//                                     <span className="flex items-center gap-1">
//                                       {isToday ? "✓" : "•"} <span className="hidden sm:inline">{getMealIcon(meal)}</span>
//                                     </span>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </td>
//                       );
//                     })}
//                     <td className="px-4 py-3 sticky right-0 bg-white z-10 border-l">
//                       <button
//                         onClick={() => navigate(`/student/${student.campusId}`)}
//                         className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
//                       >
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* No Results Message */}
//           {filteredStudents.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                 {search ? "No students found" : "No students available"}
//               </h3>
//               <p className="text-gray-500">
//                 {search ? "Try adjusting your search terms" : "Add students to get started"}
//               </p>
//             </div>
//           )}
//         </div>
//       ) : (
//         /* Card View - Fixed Campus ID Visibility */
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredStudents.map((student, idx) => (
//             <div key={student.campusId} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="font-bold text-lg text-gray-900">{student.fullName}</h3>
//                   {/* Fixed Campus ID Visibility in Card View */}
//                   <div className="bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 my-2">
//                     <p className="text-gray-900 font-mono font-bold text-sm text-center">{student.campusId}</p>
//                   </div>
//                   <p className="text-gray-600 text-sm">{student.department}</p>
//                 </div>
//                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//                   #{idx + 1}
//                 </span>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-700">Today's Status:</span>
//                   <div className="flex gap-2">
//                     {["breakfast", "lunch", "dinner"].map(meal => {
//                       const info = getVerificationStatus(student, new Date().getDate(), meal);
//                       return (
//                         <span
//                           key={meal}
//                           className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
//                             info?.status === "verified" 
//                               ? "bg-green-500 text-white" 
//                               : "bg-gray-300 text-gray-600"
//                           }`}
//                           title={`${meal}: ${info?.status === "verified" ? "Verified" : "Pending"}`}
//                         >
//                           {getMealIcon(meal)}
//                         </span>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => setExpandedStudent(expandedStudent === student.campusId ? null : student.campusId)}
//                   className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2 text-sm font-semibold transition-colors"
//                 >
//                   {expandedStudent === student.campusId ? "▲ Hide Details" : "▼ Show Monthly View"}
//                 </button>

//                 {expandedStudent === student.campusId && (
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="grid grid-cols-7 gap-1 text-xs">
//                       {monthDays.map((day, dayIdx) => (
//                         <div key={dayIdx} className="text-center">
//                           <div className="font-semibold text-gray-700 mb-1">{dayIdx + 1}</div>
//                           <div className="space-y-1">
//                             {["breakfast", "lunch", "dinner"].map(meal => {
//                               const info = getVerificationStatus(student, dayIdx + 1, meal);
//                               return (
//                                 <div
//                                   key={meal}
//                                   className={`w-4 h-4 rounded mx-auto ${
//                                     info?.status === "verified" 
//                                       ? "bg-green-500" 
//                                       : info?.status === "failed"
//                                       ? "bg-red-500"
//                                       : "bg-gray-300"
//                                   }`}
//                                   title={`${format(day, 'MMM d')} - ${meal}: ${info?.status || 'Not verified'}`}
//                                 />
//                               );
//                             })}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-2 pt-2">
//                   <button
//                     onClick={() => navigate(`/student/${student.campusId}`)}
//                     className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-2 text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
//                   >
//                     View Profile
//                   </button>
//                   <button
//                     onClick={() => {
//                       const today = new Date().getDate();
//                       handleVerify(student, "lunch", today);
//                     }}
//                     className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-2 text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
//                   >
//                     Verify Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* No Results Message for Card View */}
//           {filteredStudents.length === 0 && (
//             <div className="col-span-full text-center py-12">
//               <div className="text-6xl mb-4">🔍</div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                 {search ? "No students found" : "No students available"}
//               </h3>
//               <p className="text-gray-500">
//                 {search ? "Try adjusting your search terms" : "Add students to get started"}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Footer */}
//       <footer className="mt-8 text-center text-gray-600 border-t border-gray-200 pt-4 text-sm">
//         <div className="flex flex-col md:flex-row justify-between items-center">
//           <div className="text-gray-700">
//             © {selectedYear} Mizan-Tepi University — Meal Verification System 
//           </div>
//           <div className="flex gap-4 mt-2 md:mt-0">
//             <span className="flex items-center gap-1 text-gray-700">
//               <div className="w-3 h-3 bg-green-500 rounded"></div>
//               Verified
//             </span>
//             <span className="flex items-center gap-1 text-gray-700">
//               <div className="w-3 h-3 bg-red-500 rounded"></div>
//               Failed
//             </span>
//             <span className="flex items-center gap-1 text-gray-700">
//               <div className="w-3 h-3 bg-gray-300 rounded"></div>
//               Pending
//             </span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }