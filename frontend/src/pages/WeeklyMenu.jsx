// src/pages/WeeklyMenu.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase_connect';
import { FaEdit, FaSave, FaTimes, FaClock, FaUtensils, FaCalendarWeek, FaCheck, FaRedo } from 'react-icons/fa';

const WeeklyMenu = () => {
  const [menuSchedule, setMenuSchedule] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [originalData, setOriginalData] = useState({});

  const daysOfWeek = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];

  const mealTypes = [
    { id: 'Breakfast', name: 'Breakfast', icon: '🍳', color: 'orange' },
    { id: 'Lunch', name: 'Lunch', icon: '🍛', color: 'blue' },
    { id: 'Dinner', name: 'Dinner', icon: '🌙', color: 'purple' }
  ];

  const defaultSchedule = {
    Breakfast: { start_time: '07:00', end_time: '09:00', menu_description: '' },
    Lunch: { start_time: '12:00', end_time: '14:00', menu_description: '' },
    Dinner: { start_time: '18:00', end_time: '20:00', menu_description: '' }
  };

  // Fetch menu schedule on component mount
  useEffect(() => {
    fetchMenuSchedule();
  }, []);

  const fetchMenuSchedule = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const { data, error } = await supabase
        .from('menu_schedule')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('meal_type', { ascending: true });

      if (error) throw error;

      // Organize data by day and meal type
      const organizedData = {};
      daysOfWeek.forEach(day => {
        organizedData[day.id] = { ...defaultSchedule };
      });

      data.forEach(item => {
        if (organizedData[item.day_of_week]) {
          organizedData[item.day_of_week][item.meal_type] = {
            start_time: item.start_time,
            end_time: item.end_time,
            menu_description: item.menu_description,
            id: item.id
          };
        }
      });

      setMenuSchedule(organizedData);
      setOriginalData(JSON.parse(JSON.stringify(organizedData)));
    } catch (error) {
      console.error('Error fetching menu schedule:', error);
      setMessage({ type: 'error', text: 'Failed to load menu schedule' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dayId, mealType) => {
    setOriginalData(JSON.parse(JSON.stringify(menuSchedule)));
    setEditingDay(dayId);
    setEditingMeal(mealType);
    setMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setMenuSchedule(JSON.parse(JSON.stringify(originalData)));
    setEditingDay(null);
    setEditingMeal(null);
    setMessage({ type: 'info', text: 'Changes discarded' });
  };

  const handleSave = async (dayId, mealType) => {
    try {
      setSaving(true);
      const scheduleData = menuSchedule[dayId][mealType];
      
      // Validation
      if (!scheduleData.start_time || !scheduleData.end_time) {
        setMessage({ type: 'error', text: 'Please set both start and end times' });
        return;
      }

      if (!scheduleData.menu_description.trim()) {
        setMessage({ type: 'error', text: 'Please enter a menu description' });
        return;
      }

      // Validate time range
      if (scheduleData.start_time >= scheduleData.end_time) {
        setMessage({ type: 'error', text: 'End time must be after start time' });
        return;
      }

      const updateData = {
        menu_description: scheduleData.menu_description.trim(),
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (scheduleData.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('menu_schedule')
          .update(updateData)
          .eq('id', scheduleData.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('menu_schedule')
          .insert({
            ...updateData,
            day_of_week: dayId,
            meal_type: mealType
          });
        error = insertError;
      }

      if (error) throw error;

      setMessage({ type: 'success', text: 'Menu schedule saved successfully!' });
      setEditingDay(null);
      setEditingMeal(null);
      
      // Refresh data
      await fetchMenuSchedule();
    } catch (error) {
      console.error('Error saving menu schedule:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to save menu schedule' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (dayId, mealType, field, value) => {
    setMenuSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [mealType]: {
          ...prev[dayId][mealType],
          [field]: value
        }
      }
    }));
  };

  const getCurrentMealStatus = (dayId, mealType) => {
    const schedule = menuSchedule[dayId]?.[mealType];
    if (!schedule || !schedule.start_time || !schedule.end_time) return 'not-set';

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    if (currentDay !== dayId) return 'not-today';

    if (currentTime >= schedule.start_time && currentTime <= schedule.end_time) {
      return 'active';
    } else if (currentTime < schedule.start_time) {
      return 'upcoming';
    } else {
      return 'closed';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'not-today': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Currently Serving';
      case 'upcoming': return 'Coming Soon';
      case 'closed': return 'Service Closed';
      case 'not-today': return 'Not Today';
      default: return 'Not Scheduled';
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return JSON.stringify(menuSchedule) !== JSON.stringify(originalData);
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-orange-800 font-semibold">Loading menu schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-orange-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
                <FaCalendarWeek />
              </div>
              Weekly Menu Schedule
            </h1>
            <p className="text-gray-600 mt-2">
              Set permanent meal schedules and menus for each day of the week
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchMenuSchedule}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRedo />
              Refresh
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mt-4 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-800'
              : message.type === 'error'
              ? 'bg-red-100 border-red-400 text-red-800'
              : message.type === 'warning'
              ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
              : 'bg-blue-100 border-blue-400 text-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Schedule Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Day</th>
                {mealTypes.map(meal => (
                  <th key={meal.id} className="px-6 py-4 text-center font-semibold">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-1">{meal.icon}</span>
                      <span>{meal.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daysOfWeek.map(day => (
                <tr key={day.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="font-bold text-orange-700">{day.id + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{day.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date().getDay() === day.id && (
                            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              Today
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {mealTypes.map(meal => {
                    const schedule = menuSchedule[day.id]?.[meal.id];
                    const isEditing = editingDay === day.id && editingMeal === meal.id;
                    const status = getCurrentMealStatus(day.id, meal.id);

                    return (
                      <td key={meal.id} className="px-4 py-4">
                        <div className={`border-2 rounded-xl p-4 transition-all ${
                          isEditing ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                        }`}>
                          {/* Status Badge */}
                          <div className={`flex items-center justify-between mb-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            <span>{getStatusText(status)}</span>
                            {status === 'active' && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>

                          {isEditing ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                              {/* Time Inputs */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={schedule?.start_time || ''}
                                    onChange={(e) => handleInputChange(day.id, meal.id, 'start_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    value={schedule?.end_time || ''}
                                    onChange={(e) => handleInputChange(day.id, meal.id, 'end_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                              </div>

                              {/* Menu Description */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Menu Description
                                </label>
                                <textarea
                                  value={schedule?.menu_description || ''}
                                  onChange={(e) => handleInputChange(day.id, meal.id, 'menu_description', e.target.value)}
                                  placeholder="Enter today's menu items..."
                                  rows="3"
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleSave(day.id, meal.id)}
                                  disabled={saving}
                                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaSave />
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="flex-1 bg-gray-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaTimes />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <div className="space-y-3">
                              {/* Time Display */}
                              {schedule?.start_time && schedule?.end_time ? (
                                <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-2">
                                  <FaClock className="text-gray-600" />
                                  <span className="text-sm font-mono font-bold text-gray-800">
                                    {schedule.start_time} - {schedule.end_time}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 text-sm py-2 border border-dashed border-gray-300 rounded-lg">
                                  No schedule set
                                </div>
                              )}

                              {/* Menu Description */}
                              {schedule?.menu_description ? (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 min-h-[80px]">
                                  <div className="flex items-start gap-2">
                                    <FaUtensils className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                                      {schedule.menu_description}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg min-h-[80px] flex items-center justify-center">
                                  No menu description
                                </div>
                              )}

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEdit(day.id, meal.id)}
                                className="w-full bg-orange-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving || (editingDay !== null && editingDay !== day.id)}
                              >
                                <FaEdit />
                                {editingDay !== null ? 'Editing...' : 'Edit Schedule'}
                              </button>
                            </div>
                          )}
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

      {/* Information Panel */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCheck className="text-green-500" />
          Schedule Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-green-800">Active</div>
              <div className="text-sm text-green-600">Currently serving</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-blue-800">Upcoming</div>
              <div className="text-sm text-blue-600">Service will start soon</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div>
              <div className="font-semibold text-gray-800">Closed</div>
              <div className="text-sm text-gray-600">Service ended for today</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <div className="font-semibold text-red-800">Not Set</div>
              <div className="text-sm text-red-600">Schedule not configured</div>
            </div>
          </div>
        </div>
        
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <FaCheck className="text-yellow-600" />
              <span className="font-medium">You have unsaved changes.</span>
              <span className="text-sm">Refresh the page will discard all changes.</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-600 border-t border-gray-200 pt-4 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-700">
            © {new Date().getFullYear()} Meal Management System — Weekly Menu Schedule
          </div>
          <div className="text-gray-500 mt-2 md:mt-0">
            {hasUnsavedChanges() ? 'Unsaved changes' : 'All changes saved'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeeklyMenu;