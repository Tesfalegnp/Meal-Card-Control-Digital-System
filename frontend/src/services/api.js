// src/services/api.js
import { supabase } from './supabase_connect';

// Student related APIs
export const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('first_name');
    return { data, error };
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .single();
    return { data, error };
  },

  // Get students with QR codes
  getStudentsWithQR: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('student_id, first_name, last_name, department, qr_code')
      .not('qr_code', 'is', null)
      .order('first_name');
    return { data, error };
  },

  // Update student
  updateStudent: async (studentId, updates) => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('student_id', studentId);
    return { data, error };
  }
};

// Meal related APIs
export const mealAPI = {
  // Record meal consumption
  recordMeal: async (studentId, mealType) => {
    const { data, error } = await supabase
      .from('meal_records')
      .insert([{
        student_id: studentId,
        meal_type: mealType,
        meal_date: new Date().toISOString().split('T')[0]
      }]);
    return { data, error };
  },

  // Get daily meal stats
  getDailyStats: async (date) => {
    const { data, error } = await supabase
      .from('meal_records')
      .select('meal_type')
      .eq('meal_date', date);
    return { data, error };
  }
};

// Inventory related APIs
export const inventoryAPI = {
  // Add food item
  addFoodItem: async (itemData) => {
    const { data, error } = await supabase
      .from('food_inventory')
      .insert([itemData]);
    return { data, error };
  },

  // Get all inventory items
  getInventory: async () => {
    const { data, error } = await supabase
      .from('food_inventory')
      .select('*')
      .eq('status', 'active');
    return { data, error };
  },

  // Update inventory item
  updateInventory: async (itemId, updates) => {
    const { data, error } = await supabase
      .from('food_inventory')
      .update(updates)
      .eq('id', itemId);
    return { data, error };
  }
};

// Denied students APIs
export const deniedStudentsAPI = {
  // Get all denied students
  getDeniedStudents: async () => {
    const { data, error } = await supabase
      .from('denied_students')
      .select(`
        *,
        students (
          first_name,
          last_name,
          student_id,
          department
        )
      `)
      .eq('is_active', true);
    return { data, error };
  },

  // Toggle student access
  toggleAccess: async (studentId, deny) => {
    if (deny) {
      const { data, error } = await supabase
        .from('denied_students')
        .insert([{
          student_id: studentId,
          reason: 'Manual access denial'
        }]);
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('denied_students')
        .update({ is_active: false })
        .eq('student_id', studentId)
        .eq('is_active', true);
      return { data, error };
    }
  }
};

// Complaints APIs
export const complaintsAPI = {
  // Get all complaints
  getComplaints: async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        students (
          first_name,
          last_name,
          student_id,
          department
        )
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Respond to complaint
  respondToComplaint: async (complaintId, response) => {
    const { data, error } = await supabase
      .from('complaints')
      .update({
        response: response,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', complaintId);
    return { data, error };
  }
};

// Default export for backward compatibility
export default {
  studentAPI,
  mealAPI,
  inventoryAPI,
  deniedStudentsAPI,
  complaintsAPI
};