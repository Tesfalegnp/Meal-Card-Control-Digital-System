// /home/hope/Project_package/Meal_card/Meal-Card-Control-Digital-System/frontend/src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CafeManagerSidebar from "./sidebars/CafeManagerSidebar";
import StudentDeanSidebar from "./sidebars/StudentDeanSidebar";

export default function Layout({ children, user, onLogout }) {
  const role = user?.role || localStorage.getItem("role");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const renderSidebar = () => {
    if (role === "studentDean") {
      return (
        <StudentDeanSidebar 
          onLogout={onLogout} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      );
    } else if (role === "cafeManager") {
      return (
        <CafeManagerSidebar 
          onLogout={onLogout} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Part of flex layout */}
      {renderSidebar()}

      {/* Main Content - Automatically adjusts width using flex-1 */}
      <div className="flex-1 min-h-screen overflow-auto transition-all duration-300 ease-in-out">
        <div className="w-full max-w-full">
          {children ? children : <Outlet />}
        </div>
      </div>
    </div>
  );
} 