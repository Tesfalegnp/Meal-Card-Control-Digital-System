// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import StudentDeanDashboard from "./pages/dashboards/StudentDeanDashboard";
import CafeManagerDashboard from "./pages/dashboards/CafeManagerDashboard";
import DailyStatus from "./pages/DailyStatus";
import DenyManagement from "./pages/DenyManagement";
import QrPrint from "./pages/QrPrint";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import StudentView from "./pages/StudentView";
import Students from "./pages/Students";
import UpdateStudent from "./pages/UpdateStudent";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import CafeStudentsView from './pages/cafeteria/CafeStudentsView';
import Complaints from './pages/Complaints';
import StockRegister from './pages/store/StockRegister';
import StockRemain from './pages/store/StockRemain';
import InventoryManagement from './pages/store/InventoryManagement';
import SupplierManagement from './pages/store/SupplierManagement';
import WeeklyMenu from './pages/WeeklyMenu';
import RFID from './pages/rfid';
import CouncilRegistration from './pages/CouncilRegistration';
import SupplierView from './pages/store/SupplierView';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    if (role && username) setUser({ role, name: username });
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={`/dashboard/${user.role}`} />} />
        <Route path="/verify" element={!user ? <Verify /> : <Navigate to={`/dashboard/${user.role}`} />} />

        {/* Protected Routes */}
        <Route path="/dashboard/studentDean" element={user ? <Layout user={user} onLogout={handleLogout}><StudentDeanDashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/dashboard/cafeManager" element={user ? <Layout user={user} onLogout={handleLogout}><CafeManagerDashboard /></Layout> : <Navigate to="/login" />} />
        
        {/* Student Management */}
        <Route path="/register" element={user ? <Layout user={user} onLogout={handleLogout}><Register /></Layout> : <Navigate to="/login" />} />
        <Route path="/daily-status" element={user ? <Layout user={user} onLogout={handleLogout}><DailyStatus /></Layout> : <Navigate to="/login" />} />
        <Route path="/verif" element={user ? <Layout user={user} onLogout={handleLogout}><Verify /></Layout> : <Navigate to="/login" />} />
        <Route path="/deny-management" element={user ? <Layout user={user} onLogout={handleLogout}><DenyManagement /></Layout> : <Navigate to="/login" />} />
        {/* Fixed StudentView route with parameter */}
        <Route path="/student-view/:campusId" element={user ? <Layout user={user} onLogout={handleLogout}><StudentView /></Layout> : <Navigate to="/login" />} />
        <Route path="/students" element={user ? <Layout user={user} onLogout={handleLogout}><Students /></Layout> : <Navigate to="/login" />} />
        <Route path="/update-student/:id" element={user ? <Layout user={user} onLogout={handleLogout}><UpdateStudent /></Layout> : <Navigate to="/login" />} />
        <Route path="/cafe-students-view" element={user ? <Layout user={user} onLogout={handleLogout}><CafeStudentsView /></Layout> : <Navigate to="/login" />} />
        <Route path="/rfid-scan" element={user ? <Layout user={user} onLogout={handleLogout}><RFID /></Layout> : <Navigate to="/login" />} />
        
        {/* Store Management */}
        <Route path="/stock-register" element={user ? <Layout user={user} onLogout={handleLogout}><StockRegister /></Layout> : <Navigate to="/login" />} />
        <Route path="/stock-remain" element={user ? <Layout user={user} onLogout={handleLogout}><StockRemain /></Layout> : <Navigate to="/login" />} />
        <Route path="/inventory" element={user ? <Layout user={user} onLogout={handleLogout}><InventoryManagement /></Layout> : <Navigate to="/login" />} />
        <Route path="/supplier-management" element={user ? <Layout user={user} onLogout={handleLogout}><SupplierManagement /></Layout> : <Navigate to="/login" />} />
        <Route path="/Supplier_View" element={user ? <Layout user={user} onLogout={handleLogout}><SupplierView /></Layout> : <Navigate to="/login" />} />
        
        {/* Other Features */}
        <Route path="/qr-print" element={user ? <Layout user={user} onLogout={handleLogout}><QrPrint /></Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Layout user={user} onLogout={handleLogout}><Settings /></Layout> : <Navigate to="/login" />} />
        <Route path="/complaints" element={user ? <Layout user={user} onLogout={handleLogout}><Complaints /></Layout> : <Navigate to="/login" />} />
        <Route path="/weekly-menu" element={user ? <Layout user={user} onLogout={handleLogout}><WeeklyMenu /></Layout> : <Navigate to="/login" />} />
        <Route path="/Council_Registration" element={user ? <Layout user={user} onLogout={handleLogout}><CouncilRegistration /></Layout> : <Navigate to="/login" />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={user ? `/dashboard/${user.role}` : "/login"} />} />

        {/* Catch-all */} 
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}