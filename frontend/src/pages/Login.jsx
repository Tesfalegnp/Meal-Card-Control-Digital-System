import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const mockUsers = {
    "dean@mtu": { password: "1234", role: "studentDean", name: "Dr. Sarah Johnson" },
    "cafeManager@mtu": { password: "1234", role: "cafeManager", name: "Mr. John Doe" },
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const user = mockUsers[formData.username];
      if (user && user.password === formData.password) {
        // Save to localStorage
        localStorage.setItem("role", user.role);
        localStorage.setItem("username", user.name);

        if (onLogin) onLogin(user);

        // Navigate to dashboard
        if (user.role === "studentDean") navigate("/dashboard/studentDean");
        else if (user.role === "cafeManager") navigate("/dashboard/cafeManager");
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-blue-600 mt-2 hover:underline">
                  {showPassword ? "Hide" : "Show"} password
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold transition transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Banner */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
        <div className="relative h-full flex items-center justify-center p-12 text-center text-white">
          <div>
            <img src="/src/assets/MTU_logo.png" alt="MTU Logo" className="w-32 h-32 mx-auto mb-6" />
            <h3 className="text-4xl font-bold mb-4">
              Digital <span className="block text-blue-200">Cafeteria System</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
