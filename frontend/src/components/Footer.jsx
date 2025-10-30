import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/register", label: "Register" },
    { path: "/students", label: "Students" },
    { path: "/verify", label: "Verify" },
    { path: "/daily-status", label: "Analytics" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                🍽️
              </div>
              <div>
                <h3 className="text-xl font-bold">MTU MealCard System</h3>
                <p className="text-gray-400 text-sm">Smart Dining Solutions</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Revolutionizing campus dining experience with cutting-edge technology, 
              ensuring transparency, efficiency, and satisfaction for the entire university community.
            </p>
            <div className="flex space-x-4">
              {['📘', '📷', '🐦', '📺'].map((icon, index) => (
                <div key={index} className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-300">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <span>→</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-300">Contact Us</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <span>📧</span>
                <span>support@mtu-mealcard.edu.et</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>📞</span>
                <span>+251-123-456-789</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>🏛️</span>
                <span>Mizan Tepi University Main Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-400">
              © {currentYear} Mizan Tepi University Meal Card System. All rights reserved.
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              Developed with ❤️ by Hope | Ensuring fair and transparent access to meals daily.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}