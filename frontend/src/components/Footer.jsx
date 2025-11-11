// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} MTU MealCard System. All rights reserved.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
          Smart Dining Management Solution
        </p>
      </div>
    </footer>
  );
}