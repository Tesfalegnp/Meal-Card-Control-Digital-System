import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Students from "./pages/Students";
import Verify from "./pages/Verify";
import DailyStatus from "./pages/DailyStatus";
import StudentView from "./pages/StudentView";
import Settings from "./pages/Settings";
import DenyManagement from './pages/DenyManagement.jsx';
import UpdateStudent from "./pages/UpdateStudent.jsx";
import QrPrint from "./pages/QrPrint.jsx";



export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/students" element={<Students />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/daily-status" element={<DailyStatus />} />
          <Route path="/student/:campusId" element={<StudentView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/deny-management" element={<DenyManagement />} />
          <Route path="/students" element={<Students />} />
          <Route path="/update-student/:id" element={<UpdateStudent />} />
          <Route path="/qr-print/:id" element={<QrPrint />} />

        </Routes>
      </main> 
      <Footer />
    </BrowserRouter>
  );
} 
