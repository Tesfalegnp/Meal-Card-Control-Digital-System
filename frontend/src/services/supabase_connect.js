// src/services/supabase_connect.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xfxqwjfunevddcswgzxx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHF3amZ1bmV2ZGRjc3dnenh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDAzMDYsImV4cCI6MjA3NzcxNjMwNn0.KHgvi9sYON0c-uUQvJMO6NAi7sKs_osancOc2akS-QQ"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('students').select('count')
    if (error) throw error
    return { success: true, message: 'Connected to Supabase successfully' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}