// /home/hope/Project_package/Meal_card/Meal-Card-Control-Digital-System/frontend/src/components/layouts/DashboardLayout.jsx
import React, { useState } from 'react';

const DashboardLayout = ({ sidebar: Sidebar, children, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Part of flex layout with dynamic width */}
      <Sidebar 
        onLogout={onLogout} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Main Content Area - Flex-1 will automatically adjust based on sidebar width */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                MTU Meal Card System
              </h1>
              {/* Collapse indicator for visual feedback */}
              <div className={`flex items-center space-x-2 text-sm text-gray-500 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Sidebar Collapsed</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content - This will automatically expand/compress with sidebar */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Content wrapper that adjusts naturally */}
          <div className="w-full max-w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;