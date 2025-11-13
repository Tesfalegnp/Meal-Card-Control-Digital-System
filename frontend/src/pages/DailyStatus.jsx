// src/pages/DailyStatus.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase_connect';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { FaSearch, FaCalendarAlt, FaTable, FaTh, FaSync } from 'react-icons/fa';

const DailyStatus = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [displayMode, setDisplayMode] = useState('table'); // 'table' or 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('all');
  
  // Data states
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [mealStats, setMealStats] = useState({
    breakfast: { total: 0, ate: 0 },
    lunch: { total: 0, ate: 0 },
    dinner: { total: 0, ate: 0 }
  });
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
  const monthDays = eachDayOfInterval({
    start: startOfMonth(new Date(selectedYear, selectedMonth)),
    end: endOfMonth(new Date(selectedYear, selectedMonth))
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedMonth, selectedYear]);

  // Filter students based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('student_id, first_name, last_name, department');
      
      if (studentsError) throw studentsError;

      if (viewMode === 'daily') {
        await fetchDailyData(studentsData);
      } else {
        await fetchMonthlyData(studentsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async (studentsData) => {
    // Get meal records for selected date
    const { data: mealData, error: mealError } = await supabase
      .from('meal_records')
      .select('student_id, meal_type')
      .eq('meal_date', selectedDate);

    if (mealError) throw mealError;

    // Calculate daily statistics
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
    setFilteredStudents(studentsWithStatus);
  };

  const fetchMonthlyData = async (studentsData) => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth));

    // Get meal records for the entire month
    const { data: mealData, error: mealError } = await supabase
      .from('meal_records')
      .select('student_id, meal_type, meal_date')
      .gte('meal_date', format(startDate, 'yyyy-MM-dd'))
      .lte('meal_date', format(endDate, 'yyyy-MM-dd'));

    if (mealError) throw mealError;

    // Organize data by student and date
    const monthlyMap = {};
    studentsData.forEach(student => {
      monthlyMap[student.student_id] = {
        ...student,
        meals: {}
      };
    });

    mealData.forEach(record => {
      if (monthlyMap[record.student_id]) {
        const dateKey = record.meal_date;
        if (!monthlyMap[record.student_id].meals[dateKey]) {
          monthlyMap[record.student_id].meals[dateKey] = {};
        }
        monthlyMap[record.student_id].meals[dateKey][record.meal_type] = true;
      }
    });

    setMonthlyData(monthlyMap);
    setStudents(studentsData);
    setFilteredStudents(studentsData);
  };

  const getMonthlyStatus = (studentId, day, mealType) => {
    const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const student = monthlyData[studentId];
    return student?.meals?.[date]?.[mealType] || false;
  };

  const StatCard = ({ title, ate, total, color, icon }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color} hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{ate}</p>
            <p className="text-sm text-gray-500">/ {total}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{total > 0 ? ((ate / total) * 100).toFixed(1) : 0}%</p>
          <p className="text-sm text-gray-500">participation</p>
        </div>
      </div>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color.replace('border-', 'bg-')}`}
          style={{ width: `${total > 0 ? (ate / total) * 100 : 0}%` }}
        ></div>
      </div>
    </div>
  );

  const MealBadge = ({ hasEaten, mealType }) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🍛',
      dinner: '🌙'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        hasEaten 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <span className="mr-1">{icons[mealType]}</span>
        {hasEaten ? '✓' : '✗'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-semibold">Loading meal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                📊
              </div>
              Meal Verification System
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage student meal verifications</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaSync />
              Refresh
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                viewMode === 'daily' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarAlt />
              Daily View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                viewMode === 'monthly' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaTable />
              Monthly View
            </button>
          </div>

          {viewMode === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {viewMode === 'monthly' && (
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-xl px-4 py-2 w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2020"
                max="2030"
              />
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {viewMode === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Breakfast"
              ate={mealStats.breakfast.ate}
              total={mealStats.breakfast.total}
              color="border-orange-500"
              icon="🍳"
            />
            <StatCard
              title="Lunch"
              ate={mealStats.lunch.ate}
              total={mealStats.lunch.total}
              color="border-blue-500"
              icon="🍛"
            />
            <StatCard
              title="Dinner"
              ate={mealStats.dinner.ate}
              total={mealStats.dinner.total}
              color="border-purple-500"
              icon="🌙"
            />
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {viewMode === 'daily' && (
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full md:w-auto border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setDisplayMode('table')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                displayMode === 'table' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaTable />
              Table
            </button>
            <button
              onClick={() => setDisplayMode('cards')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                displayMode === 'cards' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaTh />
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'daily' ? (
        displayMode === 'table' ? (
          /* Daily Table View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Student Meal Attendance - {new Date(selectedDate).toLocaleDateString()}
              </h2>
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
                  {filteredStudents.map((student) => (
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
                        <MealBadge hasEaten={student.breakfast} mealType="breakfast" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <MealBadge hasEaten={student.lunch} mealType="lunch" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <MealBadge hasEaten={student.dinner} mealType="dinner" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Daily Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.student_id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{student.department}</p>
                    <div className="bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 mt-2">
                      <p className="text-gray-900 font-mono font-bold text-sm text-center">
                        {student.student_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Meal Status:</span>
                    <div className="flex gap-2">
                      <MealBadge hasEaten={student.breakfast} mealType="breakfast" />
                      <MealBadge hasEaten={student.lunch} mealType="lunch" />
                      <MealBadge hasEaten={student.dinner} mealType="dinner" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Monthly View */
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Overview - {months[selectedMonth]} {selectedYear}
            </h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <th className="px-4 py-4 sticky left-0 bg-blue-500 z-20 border-r border-blue-400 font-semibold text-left min-w-[200px]">
                    Student
                  </th>
                  {monthDays.map((day, i) => (
                    <th key={i} className="px-3 py-4 text-center whitespace-nowrap min-w-[80px] border-r border-blue-400">
                      <div className="flex flex-col">
                        <span className="font-semibold">{i + 1}</span>
                        <span className="text-xs text-blue-100">{format(day, 'EEE')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="border-b border-gray-200 hover:bg-blue-50">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r font-medium min-w-[200px]">
                      <div className="font-semibold text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-xs text-gray-700">{student.department}</div>
                      <div className="text-xs font-mono text-gray-500">{student.student_id}</div>
                    </td>
                    {monthDays.map((day, dayIdx) => {
                      const dayNumber = dayIdx + 1;
                      return (
                        <td key={dayIdx} className="px-2 py-3 text-center border-r border-gray-200">
                          <div className="flex flex-col gap-1 items-center">
                            {["breakfast", "lunch", "dinner"].map((meal) => {
                              const hasEaten = getMonthlyStatus(student.student_id, dayNumber, meal);
                              return (
                                <div
                                  key={meal}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    hasEaten 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-300 text-gray-600'
                                  }`}
                                  title={`${format(day, 'MMM d')} - ${meal}: ${hasEaten ? 'Eaten' : 'Not eaten'}`}
                                >
                                  {meal === 'breakfast' ? '🍳' : meal === 'lunch' ? '🍛' : '🌙'}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? "No students found" : "No students available"}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search terms" : "Add students to get started"}
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600 border-t border-gray-200 pt-4 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-700">
            © {new Date().getFullYear()} Meal Verification System
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span className="flex items-center gap-1 text-gray-700">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              Meal Taken
            </span>
            <span className="flex items-center gap-1 text-gray-700">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              Not Taken
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DailyStatus;