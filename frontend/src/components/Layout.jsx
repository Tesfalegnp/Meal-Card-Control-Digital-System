// src/components/Layout.jsx
import React, { useState, useCallback } from "react";
import SmartSidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SmartSidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar}
        user={user}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col lg:ml-80 transition-all duration-300 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} onLogout={onLogout} />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}