// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPalette, 
  FaBell, 
  FaDatabase, 
  FaShieldAlt, 
  FaUserCog, 
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLanguage,
  FaFont,
  FaDownload,
  FaUpload,
  FaTrash,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function Settings() {
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'dark',
    fontSize: 'medium',
    language: 'english',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    mealReminders: true,
    lowStockAlerts: true,
    
    // Privacy & Security
    autoLogout: true,
    logoutTimer: 30,
    twoFactorAuth: false,
    showSensitiveData: false,
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'daily',
    analytics: true,
    cacheData: true
  });

  const [activeTab, setActiveTab] = useState('appearance');
  const [saved, setSaved] = useState(false);
  const [changes, setChanges] = useState({});

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setChanges(prevChanges => ({ ...prevChanges, [key]: value }));
      return newSettings;
    });
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaved(true);
    setChanges({});
    setTimeout(() => setSaved(false), 3000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'dark',
      fontSize: 'medium',
      language: 'english',
      emailNotifications: true,
      pushNotifications: true,
      mealReminders: true,
      lowStockAlerts: true,
      autoLogout: true,
      logoutTimer: 30,
      twoFactorAuth: false,
      showSensitiveData: false,
      autoBackup: true,
      backupFrequency: 'daily',
      analytics: true,
      cacheData: true
    };
    setSettings(defaultSettings);
    setChanges({});
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
  };

  const hasChanges = Object.keys(changes).length > 0;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: FaPalette, color: 'from-purple-500 to-pink-500' },
    { id: 'notifications', label: 'Notifications', icon: FaBell, color: 'from-blue-500 to-cyan-500' },
    { id: 'security', label: 'Security', icon: FaShieldAlt, color: 'from-green-500 to-emerald-500' },
    { id: 'data', label: 'Data Management', icon: FaDatabase, color: 'from-orange-500 to-red-500' }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-300 text-lg">Customize your meal card system experience</p>
        </motion.div>

        {/* Save Indicator */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
            >
              <FaCheckCircle />
              Settings saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FaUserCog />
                Settings Menu
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <IconComponent className="text-lg" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-700 space-y-3">
                <motion.button
                  onClick={saveSettings}
                  disabled={!hasChanges}
                  whileHover={hasChanges ? { scale: 1.02 } : {}}
                  whileTap={hasChanges ? { scale: 0.98 } : {}}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    hasChanges
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaSave />
                  Save Changes
                </motion.button>

                <button
                  onClick={resetSettings}
                  className="w-full py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaUndo />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                      <FaPalette className="text-purple-400" />
                      Appearance Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Theme Selection */}
                      <motion.div variants={itemVariants} className="space-y-4">
                        <label className="block text-lg font-medium">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['dark', 'light', 'auto'].map(theme => (
                            <motion.button
                              key={theme}
                              onClick={() => updateSetting('theme', theme)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                settings.theme === theme 
                                  ? 'border-purple-500 bg-purple-500/20 shadow-lg' 
                                  : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                              }`}
                            >
                              <div className="text-center">
                                <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                                  theme === 'dark' ? 'bg-gray-800' :
                                  theme === 'light' ? 'bg-white' :
                                  'bg-gradient-to-r from-gray-800 to-white'
                                }`}></div>
                                <span className="text-sm font-medium">
                                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Font Size */}
                      <motion.div variants={itemVariants} className="space-y-4">
                        <label className="block text-lg font-medium">Font Size</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['small', 'medium', 'large'].map(size => (
                            <motion.button
                              key={size}
                              onClick={() => updateSetting('fontSize', size)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                settings.fontSize === size 
                                  ? 'border-green-500 bg-green-500/20 shadow-lg' 
                                  : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                              }`}
                            >
                              <div className="text-center">
                                <FaFont className={`mx-auto mb-2 ${
                                  size === 'small' ? 'text-base' :
                                  size === 'medium' ? 'text-lg' :
                                  'text-xl'
                                }`} />
                                <span className="text-sm font-medium">
                                  {size.charAt(0).toUpperCase() + size.slice(1)}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <label className="block text-lg font-medium flex items-center gap-2">
                      <FaLanguage />
                      Language
                    </label>
                    <select 
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full p-4 bg-gray-700 rounded-xl border border-gray-600 focus:outline-none focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="english">English</option>
                      <option value="amharic">Amharic</option>
                      <option value="oromo">Oromo</option>
                      <option value="tigrinya">Tigrinya</option>
                    </select>
                  </motion.div>
                </motion.div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <FaBell className="text-blue-400" />
                    Notification Preferences
                  </h3>

                  <div className="space-y-6">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time browser notifications' },
                      { key: 'mealReminders', label: 'Meal Reminders', desc: 'Reminders for upcoming meal times' },
                      { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alerts when inventory is running low' }
                    ].map(item => (
                      <motion.div
                        key={item.key}
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-xl border border-gray-600 hover:border-blue-500 transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-lg">{item.label}</div>
                          <div className="text-gray-400 text-sm">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => updateSetting(item.key, !settings[item.key])}
                          className={`w-14 h-7 rounded-full transition-colors relative ${
                            settings[item.key] ? 'bg-blue-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                            settings[item.key] ? 'translate-x-8' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <FaShieldAlt className="text-green-400" />
                    Security & Privacy
                  </h3>

                  <div className="space-y-6">
                    {/* Auto Logout */}
                    <motion.div variants={itemVariants} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-lg">Auto Logout</div>
                          <div className="text-gray-400 text-sm">Automatically logout after period of inactivity</div>
                        </div>
                        <button
                          onClick={() => updateSetting('autoLogout', !settings.autoLogout)}
                          className={`w-14 h-7 rounded-full transition-colors relative ${
                            settings.autoLogout ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                            settings.autoLogout ? 'translate-x-8' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </div>
                      {settings.autoLogout && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            Logout after {settings.logoutTimer} minutes of inactivity
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={settings.logoutTimer}
                            onChange={(e) => updateSetting('logoutTimer', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>5 min</span>
                            <span>120 min</span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Two-Factor Authentication */}
                    <motion.div variants={itemVariants} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">Two-Factor Authentication</div>
                          <div className="text-gray-400 text-sm">Add an extra layer of security to your account</div>
                        </div>
                        <button
                          onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                          className={`w-14 h-7 rounded-full transition-colors relative ${
                            settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                            settings.twoFactorAuth ? 'translate-x-8' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </div>
                      {settings.twoFactorAuth && (
                        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <FaExclamationTriangle />
                            Two-factor authentication will be enabled after you save changes
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Sensitive Data */}
                    <motion.div variants={itemVariants} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">Show Sensitive Data</div>
                          <div className="text-gray-400 text-sm">Display sensitive information like passwords</div>
                        </div>
                        <button
                          onClick={() => updateSetting('showSensitiveData', !settings.showSensitiveData)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {settings.showSensitiveData ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Data Management Settings */}
              {activeTab === 'data' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <FaDatabase className="text-orange-400" />
                    Data Management
                  </h3>

                  <div className="space-y-6">
                    {/* Auto Backup */}
                    <motion.div variants={itemVariants} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-medium text-lg">Automatic Backup</div>
                          <div className="text-gray-400 text-sm">Automatically backup your data</div>
                        </div>
                        <button
                          onClick={() => updateSetting('autoBackup', !settings.autoBackup)}
                          className={`w-14 h-7 rounded-full transition-colors relative ${
                            settings.autoBackup ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                            settings.autoBackup ? 'translate-x-8' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </div>
                      {settings.autoBackup && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                          <select 
                            value={settings.backupFrequency}
                            onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                            className="w-full p-3 bg-gray-600 rounded-lg border border-gray-500 focus:outline-none focus:border-orange-500"
                          >
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    </motion.div>

                    {/* Analytics */}
                    <motion.div variants={itemVariants} className="flex items-center justify-between p-6 bg-gray-700 rounded-xl border border-gray-600">
                      <div>
                        <div className="font-medium text-lg">Usage Analytics</div>
                        <div className="text-gray-400 text-sm">Help improve the system by sharing usage data</div>
                      </div>
                      <button
                        onClick={() => updateSetting('analytics', !settings.analytics)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          settings.analytics ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.analytics ? 'translate-x-8' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </motion.div>

                    {/* Cache Data */}
                    <motion.div variants={itemVariants} className="flex items-center justify-between p-6 bg-gray-700 rounded-xl border border-gray-600">
                      <div>
                        <div className="font-medium text-lg">Cache Data</div>
                        <div className="text-gray-400 text-sm">Store data locally for faster loading</div>
                      </div>
                      <button
                        onClick={() => updateSetting('cacheData', !settings.cacheData)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          settings.cacheData ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.cacheData ? 'translate-x-8' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FaDownload />
                        Export Data
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FaUpload />
                        Backup Now
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FaTrash />
                        Clear Cache
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}