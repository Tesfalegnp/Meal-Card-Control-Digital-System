import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentImage, setCurrentImage] = useState(0);

  const mockUsers = {
    "dean@mtu": { password: "1234", role: "studentDean", name: "Dr. Sarah Johnson" },
    "cafeManager@mtu": { password: "1234", role: "cafeManager", name: "Mr. John Doe" },
  };

  // Background images for slideshow
  const backgroundImages = [
    "/src/assets/bg.gif",
    "/src/assets/bg2.gif",
    "/src/assets/images/campus-logo.png",
    "/src/assets/react.svg"
  ];

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImages[currentImage]})`,
              filter: "brightness(0.3) contrast(1.2)"
            }}
          />
        </AnimatePresence>
        
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Floating Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
        variants={floatingAnimation}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-32 right-32 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"
        variants={floatingAnimation}
        animate="animate"
        style={{ animationDelay: "1s" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"
        variants={floatingAnimation}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          {/* Logo and Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-4"
            >
              <img 
                src="/src/assets/MTU_logo.png" 
                alt="MTU Logo" 
                className="w-20 h-20 mx-auto filter drop-shadow-lg"
              />
            </motion.div>
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-blue-100/80"
            >
              Sign in to your account
            </motion.p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-2xl shadow-lg"
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3"
                  >
                    <span className="text-white text-sm">!</span>
                  </motion.div>
                  <p className="text-sm font-medium text-red-100">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Username
                </label>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-2xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your username"
                  />
                </motion.div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Password
                </label>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3.5 bg-white/5 border border-white/20 rounded-2xl placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white backdrop-blur-sm pr-12 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-400 bg-white/10 border-white/20 rounded focus:ring-blue-400/50"
                    />
                  </motion.div>
                  <span className="text-sm text-white/80">Remember me</span>
                </label>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200"
                >
                  Forgot password?
                </motion.a>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                variants={itemVariants}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-400/90 hover:to-purple-500/90 text-white font-semibold shadow-2xl relative overflow-hidden disabled:opacity-50 transition-all duration-200"
              >
                <motion.div
                  animate={isLoading ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                  transition={isLoading ? { duration: 1.5, repeat: Infinity } : {}}
                  className="relative z-10"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Authenticating...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </motion.div>
                
                {/* Button Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8 }}
                />
              </motion.button>
            </form>

                </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-6"
          >
            <p className="text-white/40 text-sm">
              © 2025 MTU Cafeteria System. by Tesfalegn Petros from Softwere Departement. 
              All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Banner - Enhanced */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:block relative flex-1"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl"></div>
        <div className="relative h-full flex items-center justify-center p-12 text-center text-white">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.img 
              src="/src/assets/MTU_logo.png" 
              alt="MTU Logo" 
              className="w-40 h-40 mx-auto mb-6 filter drop-shadow-2xl"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.h3 
              className="text-5xl font-bold mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
            >
              Digital{" "}
              <motion.span 
                className="block text-blue-200 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ 
                  backgroundSize: "200% 100%",
                }}
              >
                Cafeteria System
              </motion.span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl text-blue-100/80 max-w-md mx-auto leading-relaxed"
            >
              Streamlining campus dining with modern technology and seamless user experience.
            </motion.p>
            
            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 space-y-3 text-left max-w-sm mx-auto"
            >
              {["Real-time Inventory Management", "Smart Menu Planning", "Automated Stock Alerts", "Student Analytics"].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  className="flex items-center text-blue-100/90"
                >
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full mr-3"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}