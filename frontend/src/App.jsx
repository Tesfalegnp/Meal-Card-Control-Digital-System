// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import StudentDeanDashboard from "./pages/dashboards/StudentDeanDashboard";
import CafeManagerDashboard from "./pages/dashboards/CafeManagerDashboard";
import DailyStatus from "./pages/DailyStatus";
import DenyManagement from "./pages/DenyManagement";
import NotFound from "./pages/NotFound";
import QrPrint from "./pages/QrPrint";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import StudentView from "./pages/StudentView";
import Students from "./pages/Students";
import UpdateStudent from "./pages/UpdateStudent";
import Verify from "./pages/Verify";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        const authStatus = localStorage.getItem('isAuthenticated');
        
        if (savedUser && authStatus === 'true') {
          setCurrentUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userProfile) => {
    try {
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userProfile));
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const handleLogout = () => {
    try {
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={`/dashboard/${currentUser?.role || 'cafeManager'}`} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={`/dashboard/${currentUser?.role || 'cafeManager'}`} replace />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/verify"
          element={
            isAuthenticated ? (
              <Navigate to={`/dashboard/${currentUser?.role || 'cafeManager'}`} replace />
            ) : (
              <Verify />
            )
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard/studentDean"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <StudentDeanDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/cafeManager"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <CafeManagerDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Additional Protected Routes */}
        <Route
          path="/daily-status"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <DailyStatus />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/deny-management"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <DenyManagement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/qr-print"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <QrPrint />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/student-view"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <StudentView />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/students"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <Students />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/update-student"
          element={
            isAuthenticated ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <UpdateStudent />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Root path redirect */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? `/dashboard/${currentUser?.role || 'cafeManager'}` : "/login"} replace />
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}