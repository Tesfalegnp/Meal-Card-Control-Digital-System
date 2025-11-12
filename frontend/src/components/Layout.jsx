import React from "react";
import { Outlet } from "react-router-dom";
import CafeManagerSidebar from "./sidebars/CafeManagerSidebar";
import StudentDeanSidebar from "./sidebars/StudentDeanSidebar";

export default function Layout({ children, user, onLogout }) {
  const role = user?.role || localStorage.getItem("role");

  const renderSidebar = () => {
    if (role === "studentDean") {
      return <StudentDeanSidebar onLogout={onLogout} />;
    } else if (role === "cafeManager") {
      return <CafeManagerSidebar onLogout={onLogout} />;
    } else {
      return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {children ? children : <Outlet />}
      </div>
    </div>
  );
}
